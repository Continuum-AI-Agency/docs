#!/usr/bin/env node
// Generates the MCP tool reference (mcp/tools.mdx, mcp/tools/*.mdx, mcp/tools.json) from
// drafts/mcp/source.json, the catalog exported from the server with help_describe's own code.
//   node scripts/mcp-docs.mjs                                  write pages from the snapshot
//   node scripts/mcp-docs.mjs --check                          fail if pages drifted from it
//   node scripts/mcp-docs.mjs --refresh <backend> <monorepo>   re-export the snapshot, then write
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { actionInputs, areas, codeMeaning, confirmationExceptions, extraStatuses, factOverrides, goodToKnow, inputGlossary, integrationNotes, needs, relatedExtras, roleLevels, roles, terms, unlistedAreas } from './mcp-notes.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'drafts/mcp/source.json');
const SITE = 'https://docs.trycontinuum.ai';
// Server text can hold {braces} and <placeholders>, which MDX would parse as code; escape them
// outside inline code spans.
const retire = (text) => Object.entries(terms).reduce((t, [from, to]) => t.replaceAll(from, to), String(text));
// Server-written prose: code-format snake_case identifiers and key=value fragments so they read as
// code and Mintlify's markdown export doesn't escape them (help\_describe).
const srv = (text) => retire(text).replace(/\{[^{}\n]*\}/g, (m) => `\`${m.replaceAll('`', '')}\``).split(/(`[^`\n]*`)/).map((part, i) => i % 2 ? part
  : part.replace(/\b(?:[a-z][a-z0-9]*|[A-Z][A-Z0-9]*)(?:_[a-zA-Z0-9*]*)+(?:\.[a-z_]+)*(?:=[\w'".:-]+)?/g, (m) => `\`${m}\``)).join('');
const mdx = (text) => retire(text).split(/(`[^`\n]*`)/).map((part, i) => i % 2 ? part
  : part.replaceAll('{', '\\{').replaceAll('}', '\\}').replaceAll('<', '&lt;').replaceAll('>', '&gt;')).join('');
const cell = (text) => mdx(text).replaceAll('|', '\\|').replaceAll('\n', ' ');
const code = (text) => `\`${text}\``;
const ROLE = { viewer: 'Viewer or higher', operator: 'Operator or higher', admin: 'Admin or Owner', owner: 'Owner' };
const CONFIRMATION = {
  none: 'None. The call runs when made.',
  two_phase_confirm_token: 'Writes preview first and return a `confirm_token` with `expires_at`. Confirm with that token after the person says yes.',
  elicitation_or_confirm_token: 'Writes preview first: a confirmation dialog in clients that support it, otherwise a `confirm_token` to send back after a yes.',
  approval_token: 'The person approves the pending change; the approval is the yes.',
  admin_grant: 'An Admin or Owner grants a pending change by its token.',
};
const EXECUTION = {
  sync: 'Returns the result in the same call.',
  async_job: 'Returns a `job_id`. Read the result with `jobs_status`.',
  sync_then_async: 'Returns right away. Longer work continues as a job; read the id in the result.',
  background_refresh: 'Returns what is ready now. A refresh keeps running in the background; read again shortly.',
};
const RETRY = {
  natural_read: 'Safe to retry: it only reads.',
  naturally_idempotent: 'Safe to retry: repeating the call gives the same result.',
  idempotency_key: 'Retry with the same `idempotency_key` to avoid duplicates.',
  confirm_token_single_use: 'Each `confirm_token` works once. Preview again to retry.',
  none: 'Not idempotent. Check the current state before retrying.',
};

function listed(tool) {
  if (tool.state !== 'advertised') return 'Not in `tools/list`. Call it by name; `help_describe` has its schema.';
  if (tool.surface.alwaysAvailable) return 'Always.';
  if (tool.surface.requiresIntegration) return `When a brand you can reach has a ${tool.surface.requiresIntegration} connection.`;
  return 'When your role on a brand you can reach allows it.';
}
const role = (tool) => roles[tool.name] ?? ROLE[tool.surface.requiresRole] ?? (tool.brandScoped ? 'Any brand member' : 'Anyone signed in');

function errors(tool) {
  const out = new Map(tool.commonErrors.map(e => [e.code, srv(e.reason)]));
  const add = (key, text) => { if (!out.has(key)) out.set(key, text); };
  for (const c of tool.errorCodes) {
    assert.ok(codeMeaning[c], `No meaning for ${c} (${tool.name}); add it to scripts/mcp-notes.mjs`);
    add(c, codeMeaning[c]);
  }
  // Tools that are always listed check the brand themselves and return the needs_brand status;
  // the rest are stopped by the dispatcher with the BRAND_NOT_SELECTED error.
  if (tool.brandScoped) {
    if (tool.surface.alwaysAvailable) add('needs_brand', needs.needs_brand());
    else add('BRAND_NOT_SELECTED', codeMeaning.BRAND_NOT_SELECTED);
  }
  const r = tool.surface.requiresRole;
  const levels = roleLevels[tool.name];
  if ((r && r !== 'viewer') || (levels && (levels.all !== 'viewer' || levels.operator?.length || levels.admin?.length)))
    add('needs_role', `The person's role is too low for this call. Needs: ${role(tool).replace(/\.?$/, '.')} Ask an Admin or Owner.`);
  if (tool.surface.requiresIntegration) add('needs_integration', needs.needs_integration(tool.surface.requiresIntegration));
  else if (connections(tool)) add('needs_integration', 'The brand lacks the connection this call needs. Call `integrations_connect` with the `platform` the result names.');
  if (['two_phase_confirm_token', 'elicitation_or_confirm_token'].includes(tool.facts.confirmation))
    add('CONFIRMATION_REQUIRED', codeMeaning.CONFIRMATION_REQUIRED);
  if (tool.rateLimit) add('RATE_LIMITED', codeMeaning.RATE_LIMITED);
  for (const [status, when] of extraStatuses[tool.name] ?? []) add(status, when);
  add('VALIDATION_ERROR', codeMeaning.VALIDATION_ERROR);
  return [...out].map(([c, when]) => ({ code: c, kind: /^[A-Z_]+$/.test(c) ? 'error' : 'status', when }));
}

const names = (inputs, required) => inputs.filter(i => i.required === required).map(i => i.name);
// Flat tools share one input object across actions. Their per-action inputs come from the reviewed
// actionInputs notes when the handler checks them, or from probing the validator otherwise.
function actionRows(tool) {
  const reviewed = actionInputs[tool.name];
  return tool.actions.map(a => {
    if (reviewed?.[a.name]) return { name: a.name, required: [tool.actionKey, ...reviewed[a.name].required], optional: reviewed[a.name].uses };
    return { name: a.name, required: names(a.inputs, true), optional: tool.flat ? null : names(a.inputs, false) };
  });
}
const sharedInputs = (tool) => tool.flat && !actionInputs[tool.name]
  ? tool.actions[0].inputs.filter(i => i.name !== tool.actionKey).map(i => i.name) : null;
const codeList = (list, max = 14) => list.length === 0 ? '—'
  : list.slice(0, max).map(code).join(', ') + (list.length > max ? `, and ${list.length - max} more` : '');

// Cards for people; the same links as a plain list in the markdown agents read.
const next = (items) => `<Visibility for="humans">\n<CardGroup cols={2}>\n${items.map(([title, icon, href, body]) =>
  `<Card title="${title}" icon="${icon}" href="${href}">${body}</Card>`).join('\n')}\n</CardGroup>\n</Visibility>\n\n<Visibility for="agents">\n${
  items.map(([title, , href, body]) => `- [${title}](${href}): ${body}`).join('\n')}\n</Visibility>\n`;
const anchor = (name) => name;

function toolSection(tool, oneLiner) {
  const facts = tool.facts;
  const rows = [
    ['Changes things', tool.mutates ? 'Yes' : 'No'],
    ['Listed in your assistant', listed(tool)],
    ['Role', role(tool)],
    ['Needs', [tool.brandScoped ? 'An active brand.' : 'No brand.', connections(tool) && `Connection: ${connections(tool)}`].filter(Boolean).join(' ')],
    ['Confirmation', CONFIRMATION[facts.confirmation]],
    ['Completion', EXECUTION[facts.execution]],
    ['Retry', RETRY[facts.idempotency]],
  ];
  if (tool.rateLimit) rows.push(['Rate limit', `${tool.rateLimit.budget} calls per ${tool.rateLimit.windowSeconds / 3600} hour per ${tool.rateLimit.scope}. See [Limits](/mcp/reference#limits).`]);
  let out = `### \`${tool.name}\`\n\n${oneLiner}\n\n`;
  if (goodToKnow[tool.name]) out += `**Good to know:**\n\n${goodToKnow[tool.name].map(n => `- ${n}`).join('\n')}\n\n`;
  out += `| Contract | Behavior |\n| --- | --- |\n`;
  for (const [k, v] of rows) out += `| ${k} | ${cell(v)} |\n`;
  out += `\n`;
  if (tool.actions) {
    const shared = sharedInputs(tool);
    out += `**Actions** (\`${tool.actionKey}\`):\n\n| ${cell(tool.actionKey)} | Required inputs |${shared ? '' : ' Other inputs it uses |'}\n| --- | --- |${shared ? '' : ' --- |'}\n`;
    for (const a of actionRows(tool)) out += `| ${code(a.name)} | ${cell(codeList(a.required))} |${shared ? '' : ` ${cell(codeList(a.optional))} |`}\n`;
    if (shared) out += `\nOther inputs, shared by every action (the live schema says which each action reads): ${codeList(shared, 60)}.\n`;
    if (actionInputs[tool.name]) out += `\nIn this table, \`a|b\` means one of them and \`a+b\` means together.\n`;
  } else if (tool.inputs.length) {
    out += `**Inputs:**\n\n| Input | Type | Required | About |\n| --- | --- | --- | --- |\n`;
    for (const i of tool.inputs) out += `| ${code(i.name)} | ${cell(i.type)} | ${i.required ? 'Yes' : 'No'} | ${cell([i.description && srv(i.description), i.values && `One of ${i.values.map(code).join(', ')}.`].filter(Boolean).join(' ') || '—')} |\n`;
  } else {
    out += `**Inputs:** none.\n`;
  }
  // People get highlighted JSON. Agents get one call per line in inline code: Mintlify's markdown
  // export adds theme metadata to every code fence, which inline code avoids.
  const calls = tool.examples.slice(0, 6);
  out += `\n**Examples** (IDs are illustrative; use the ones earlier calls return):\n\n<Visibility for="humans">\n`;
  for (const example of calls)
    out += `${cell(srv(example.title))}:\n\n\`\`\`json\n${JSON.stringify({ name: tool.name, arguments: example.arguments }, null, 2)}\n\`\`\`\n\n`;
  out += `</Visibility>\n\n<Visibility for="agents">\n${calls.map(e => `- ${cell(srv(e.title))}: \`${JSON.stringify({ name: tool.name, arguments: e.arguments })}\``).join('\n')}\n</Visibility>\n\n`;
  out += `**Errors and statuses:**\n\n| Code | When |\n| --- | --- |\n`;
  for (const e of errors(tool)) out += `| ${code(e.code)} | ${cell(e.when)} |\n`;
  if (tool.relatedTools.length) out += `\n**Related:** ${tool.relatedTools.map(code).join(', ')}.\n`;
  const schemaCall = tool.actions ? `{"tool":"${tool.name}","action":"${tool.actions[0].name}"}` : `{"tool":"${tool.name}"}`;
  const keyNote = tool.actions && tool.actionKey !== 'action' ? ` \`help_describe\`'s \`action\` takes a \`${tool.actionKey}\` value.` : '';
  out += `\nFull schema: \`help_describe ${schemaCall}\`.${keyNote} As JSON: [\`/mcp/schemas/${tool.name}.json\`](/mcp/schemas/${tool.name}.json).\n\n`;
  return out;
}

const PLATFORM = { facebook: 'Meta (Facebook)', instagram: 'Instagram', google: 'Google', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok' };
// The connections a tool needs: declared, checked in its handler, or required by the backers it reaches.
function connections(tool) {
  if (integrationNotes[tool.name]) return integrationNotes[tool.name];
  if (tool.surface.requiresIntegration) return `${PLATFORM[tool.surface.requiresIntegration] ?? tool.surface.requiresIntegration}.`;
  if (tool.delegateIntegrations?.length)
    return `The one for what you act on: ${tool.delegateIntegrations.map(p => PLATFORM[p] ?? p).join(', ')}.`;
  return null;
}

// One entry per input across every action; allowed values are the union over actions, so a
// discriminator such as `action` lists every action rather than the last branch's.
function mergeInputs(rows) {
  const merged = {};
  for (const { name, required, ...about } of rows) {
    const seen = merged[name];
    merged[name] = seen ? { ...seen, ...about, ...(seen.values || about.values
      ? { values: [...new Set([...(seen.values ?? []), ...(about.values ?? [])])] } : {}) } : about;
  }
  return merged;
}

// Per-action confirmation where it differs from the tool's: reads (Viewer actions) never confirm,
// and reviewed exceptions such as Forge set_delete.
function confirmationByAction(tool) {
  const base = tool.facts?.confirmation ?? 'none';
  if (base === 'none') return {};
  const { roleByAction } = roleFields(tool);
  const out = {};
  for (const a of tool.actions) {
    const value = confirmationExceptions[tool.name]?.[a.name] ?? (roleByAction?.[a.name] === 'viewer' ? 'none' : base);
    if (value !== base) out[a.name] = value;
  }
  return Object.keys(out).length ? { confirmationExceptions: out } : {};
}

// Machine-readable role: the minimum brand role, plus per-action roles where they differ.
function roleFields(tool) {
  const levels = roleLevels[tool.name];
  const base = tool.surface.requiresRole ?? levels?.all ?? (tool.brandScoped ? 'viewer' : 'none');
  if (!levels || !tool.actions) return { role: base };
  const byAction = Object.fromEntries(tool.actions.map(a => [a.name,
    ['viewer', 'operator', 'admin'].find(r => levels[r]?.includes(a.name)) ?? levels.all]));
  for (const r of ['viewer', 'operator', 'admin'])
    for (const action of levels[r] ?? []) assert.ok(action in byAction, `roleLevels: ${tool.name} has no action ${action}`);
  return { role: base, roleByAction: byAction };
}

// Related tools: the server's list, plus registered tools its description or our notes name.
function relatedFor(tool, names) {
  const text = [tool.description, ...(goodToKnow[tool.name] ?? [])].join(' ');
  const named = [...names].filter(n => n !== tool.name && new RegExp(`\\b${n}\\b`).test(text));
  return [...new Set([...tool.relatedTools, ...(relatedExtras[tool.name] ?? []), ...named])];
}

export function buildOutputs(source) {
  // Fill undescribed inputs from the reviewed glossary, keeping the server's own descriptions.
  for (const tool of source.tools)
    for (const row of [...(tool.inputs ?? []), ...(tool.actions ?? []).flatMap(a => a.inputs)])
      if (!row.description && inputGlossary[row.name]) row.description = inputGlossary[row.name];
  const registeredNames = new Set(source.tools.map(t => t.name));
  for (const tool of source.tools) tool.relatedTools = relatedFor(tool, registeredNames);
  for (const tool of source.tools) if (factOverrides[tool.name]) tool.facts = { ...tool.facts, ...factOverrides[tool.name] };
  const advertised = source.tools.filter(t => t.state === 'advertised');
  const internal = source.tools.filter(t => t.state === 'internal');
  assert.deepEqual(unlistedAreas.flatMap(a => a.tools).sort(), internal.map(t => t.name).sort(), 'Unlisted tools drifted: update unlistedAreas in scripts/mcp-notes.mjs');
  const unlistedSlug = new Map(unlistedAreas.flatMap(a => a.tools.map(n => [n, a.slug])));
  const byName = new Map(source.tools.map(t => [t.name, t]));
  const mapped = areas.flatMap(a => Object.keys(a.tools));
  assert.deepEqual([...mapped].sort(), advertised.map(t => t.name).sort(), 'Advertised tools drifted: update areas in scripts/mcp-notes.mjs');
  for (const name of Object.keys(goodToKnow)) assert.ok(byName.has(name), `goodToKnow names an unknown tool: ${name}`);
  for (const [name, byAction] of Object.entries(actionInputs)) {
    const tool = byName.get(name);
    assert.ok(tool?.actions, `actionInputs names an unknown tool: ${name}`);
    const props = new Set(Object.keys(tool.inputSchema.properties ?? {}));
    assert.deepEqual(Object.keys(byAction).sort(), tool.actions.map(a => a.name).sort(), `actionInputs must cover every action of ${name}`);
    for (const [action, { required, uses }] of Object.entries(byAction))
      for (const input of [...required, ...uses].flatMap(x => x.split(/[|+]/)))
        assert.ok(props.has(input.split('.')[0]), `${name}.${action}: no input named ${input}`);
  }
  assert.equal(source.helpIndex.length, source.counts.registered, 'help_describe index and registry counts differ');
  const header = `{/* Generated by scripts/mcp-docs.mjs from drafts/mcp/source.json; edit scripts/mcp-notes.mjs instead. */}\n`;
  const checked = `Generated from the server's own tool registry, as released on ${source.backend.date}.`;
  const files = {};

  for (const area of areas) {
    let page = `---\ntitle: "${area.title}"\nsidebarTitle: "${area.sidebarTitle}"\ndescription: "${area.description}"\n---\n\n${header}\n`;
    page += `${checked} Every section lists what the tool needs, whether it waits for a yes, how it completes, each action's inputs, valid example calls, and the errors it can return. Before you call a tool, fetch its live schema with \`help_describe\`; if the server and this page disagree, the server wins.\n\n`;
    page += `| Tool | What it does | Changes things |\n| --- | --- | --- |\n`;
    for (const [name, line] of Object.entries(area.tools))
      page += `| [${code(name)}](#${anchor(name)}) | ${cell(line)} | ${byName.get(name).mutates ? 'Yes' : 'No'} |\n`;
    page += `\n`;
    for (const [name, line] of Object.entries(area.tools)) page += toolSection(byName.get(name), line);
    const others = areas.filter(a => a !== area).slice(0, 3);
    page += `## What's next\n\n${next([['All tools', 'toolbox', '/mcp/tools', 'Every tool on one page, and the machine-readable index.'],
      ...others.map(o => [o.title, 'arrow-right', `/mcp/tools/${o.slug}`, `${o.tools[Object.keys(o.tools)[0]].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').split('.')[0]}, and more.`])])}`;
    files[`mcp/tools/${area.slug}.mdx`] = page;
  }

  let overview = `---\ntitle: "Tool reference"\ndescription: "All ${advertised.length} tools the Continuum connector lists, and the ${internal.length} more it accepts by name: what each does, whether it changes anything, and where its full contract lives."\n---\n\n${header}\n`;
  overview += `You don't need to know tool names to use Continuum. Your assistant picks them for you. This page is for admins reviewing what a connector can do and for anyone building with an agent.\n\n`;
  overview += `The server registers **${source.counts.registered} tools**. Your assistant's tool list (\`tools/list\`) shows up to **${advertised.length}** of them: the ones your [role](/settings/roles) and connected platforms allow. The other **${internal.length}** are writes and helpers reached through the listed tools; they stay callable by name. \`help_describe\` with no arguments returns all ${source.counts.registered}.\n\n`;
  overview += `<Info>Tools marked **Changes things** can modify your brand. The ones that publish, change your ads, produce final Forge versions, or delete something show a preview and wait for your yes. See [You stay in control](/mcp/control).</Info>\n\n`;
  overview += `## For agents\n\n- **Index:** [\`/mcp/tools.json\`](/mcp/tools.json) lists every registered tool with its role, connection, confirmation, completion, retry behavior, actions with required and optional inputs, an example call, and its errors. ${checked}\n- **Live schema:** call \`help_describe {"tool": "<name>", "action": "<action>"}\` before the first call to a tool. If it disagrees with these pages, follow the server.\n- **Forge:** the [operation index](/forge/agent-manifest.json) and [function reference](/forge/functions) carry per-action contracts for \`forge_query\` and \`forge_manage\`.\n- **How to behave:** read the [agent brief](/mcp/agent-brief) and the [server reference](/mcp/reference) for sign-in, brand scope, confirmations, statuses, and limits.\n\n`;
  for (const area of areas) {
    overview += `## ${area.title}\n\nFull contracts: [${area.sidebarTitle} tools](/mcp/tools/${area.slug}).\n\n| Tool | What it does | Changes things |\n| --- | --- | --- |\n`;
    for (const [name, line] of Object.entries(area.tools))
      overview += `| [${code(name)}](/mcp/tools/${area.slug}#${anchor(name)}) | ${cell(line)} | ${byName.get(name).mutates ? 'Yes' : 'No'} |\n`;
    overview += `\n`;
  }
  overview += `## Not in the tool list\n\nThese are registered and callable by name, but \`tools/list\` doesn't advertise them: most are writes and helpers the listed tools reach for you. Use the listed tool unless a result or a tool description names one of these. Their full schemas come from \`help_describe\`.\n\n| Tool | What the server says it does | Changes things |\n| --- | --- | --- |\n`;
  // A whole tool that isn't built yet, as opposed to one unsupported input ("Non-Instagram platforms not yet supported").
  const unbuilt = (t) => t.commonErrors.some(e => e.code === 'NOT_IMPLEMENTED' && /not yet implemented/i.test(e.reason));
  const unlistedLine = (t) => `${srv(t.summary)}${unbuilt(t) ? ' **Not available yet:** it returns `NOT_IMPLEMENTED`.' : ''}`;
  for (const t of internal)
    overview += `| [${code(t.name)}](/mcp/tools/${unlistedSlug.get(t.name)}#${anchor(t.name)}) | ${cell(unlistedLine(t))} | ${t.mutates ? 'Yes' : 'No'} |\n`;
  for (const area of unlistedAreas) {
    let page = `---\ntitle: "${area.title}"\nsidebarTitle: "${area.sidebarTitle}"\ndescription: "${area.description}"\n---\n\n${header}\n`;
    page += `${checked} These tools are registered and callable by name, but \`tools/list\` doesn't advertise them: most are writes and helpers the listed tools reach for you. Use the listed tool unless a result or a tool description names one of these, and fetch the live schema with \`help_describe\` first.\n\n| Tool | What it does | Changes things |\n| --- | --- | --- |\n`;
    for (const name of area.tools) { const t = byName.get(name); page += `| [${code(name)}](#${anchor(name)}) | ${cell(unlistedLine(t))} | ${t.mutates ? 'Yes' : 'No'} |\n`; }
    page += `\n`;
    for (const name of area.tools) page += toolSection(byName.get(name), cell(unlistedLine(byName.get(name))));
    const other = unlistedAreas.find(a => a !== area);
    page += `## What's next\n\n${next([['All tools', 'toolbox', '/mcp/tools', 'Every tool on one page, and the machine-readable index.'], [other.title, 'arrow-right', `/mcp/tools/${other.slug}`, other.description.split(':')[0] + '.']])}`;
    files[`mcp/tools/${area.slug}.mdx`] = page;
  }
  overview += `\n## Ready-made prompts\n\nThe connector also offers three prompts your assistant may list in its menu:\n\n| Prompt | What it does |\n| --- | --- |\n| \`analytics-weekly-review\` | A weekly review across social and ads. |\n| \`analytics-top-and-bottom-posts\` | Your best and worst organic posts, and why. |\n| \`analytics-top-and-bottom-ads\` | Your best and worst ads, and why. |\n\n`;
  overview += `## What's next\n\n${next([['Agent brief', 'robot', '/mcp/agent-brief', 'How an assistant should use these tools.'], ['Server reference', 'server', '/mcp/reference', 'Endpoints, sign-in, confirmations, result codes, and limits.']])}`;
  files['mcp/tools.mdx'] = overview;

  const areaOf = new Map(areas.flatMap(a => Object.keys(a.tools).map(n => [n, a])));
  const index = {
    version: 1,
    source: { ...source.backend, generator: 'scripts/mcp-docs.mjs' },
    server: { url: 'https://api.trycontinuum.ai/mcp', chatgpt: 'https://api.trycontinuum.ai/mcp/chatgpt', auth: 'OAuth 2.1 with PKCE; no API keys' },
    discovery: { name: 'help_describe', arguments: { tool: '<name>', action: '<action>' }, note: 'The live schema wins over this index.' },
    counts: { registered: source.counts.registered, listed: advertised.length, notListed: internal.length },
    legend: { confirmation: CONFIRMATION, completion: EXECUTION, retry: RETRY, role: { none: 'No brand role needed.', viewer: 'Viewer or higher.', operator: 'Operator or higher.', admin: 'Admin or Owner.' }, errorKind: { error: 'Returned as an error (isError: true).', status: 'Returned as a normal result whose status says what to do next.' } },
    docs: { overview: `${SITE}/mcp/tools`, agentBrief: `${SITE}/mcp/agent-brief`, serverReference: `${SITE}/mcp/reference` },
    tools: source.tools.map(t => {
      const area = areaOf.get(t.name);
      return {
        name: t.name,
        listed: t.state === 'advertised',
        ...(unbuilt(t) ? { available: false } : {}),
        ...(area ? { area: area.slug, docs: `${SITE}/mcp/tools/${area.slug}#${anchor(t.name)}`, summary: area.tools[t.name].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') } : { docs: `${SITE}/mcp/tools/${unlistedSlug.get(t.name)}#${anchor(t.name)}`, summary: retire(t.summary) }),
        mutates: t.mutates,
        ...roleFields(t),
        integration: t.surface.requiresIntegration ?? null,
        ...(connections(t) ? { connectionNote: connections(t).replace(/`/g, '') } : {}),
        brandScoped: t.brandScoped,
        confirmation: t.facts?.confirmation ?? null,
        completion: t.facts?.execution ?? null,
        retry: t.facts?.idempotency ?? null,
        roleNote: role(t),
        rateLimit: t.rateLimit,
        inputs: mergeInputs(t.actions ? t.actions.flatMap(a => a.inputs) : t.inputs),
        ...(t.actions ? {
          actionKey: t.actionKey,
          actions: actionRows(t).map(a => ({ name: a.name, required: a.required, ...(a.optional ? { uses: a.optional } : {}) })),
          ...(sharedInputs(t) ? { sharedInputs: sharedInputs(t) } : {}),
          // Inputs every action requires (agent_ask: target and query).
          required: actionRows(t).map(a => a.required).reduce((all, r) => all.filter(x => r.includes(x))),
          ...confirmationByAction(t),
        } : { required: names(t.inputs, true) }),
        schema: `${SITE}/mcp/schemas/${t.name}.json`,
        examples: t.examples.slice(0, 6).map(e => ({ title: e.title, arguments: e.arguments })),
        errors: t.facts ? errors(t) : t.commonErrors.map(e => ({ code: e.code, when: retire(e.reason) })),
        ...(goodToKnow[t.name] ? { notes: goodToKnow[t.name].map(n => n.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')) } : {}),
        related: t.relatedTools,
      };
    }),
  };
  for (const t of index.tools) if (t.actions)
    assert.equal(t.inputs[t.actionKey]?.values?.length, t.actions.length, `${t.name}: ${t.actionKey} values drifted from its actions`);
  files["mcp/tools.json"] = `${JSON.stringify(index)}\n`;
  for (const t of source.tools) files[`mcp/schemas/${t.name}.json`] = `${JSON.stringify({ name: t.name, inputSchema: t.inputSchema })}\n`;
  files['llms.txt'] = llms(index, files);
  return files;
}

// llms.txt (llmstxt.org): the site map agents fetch first, in nav order, plus every machine surface.
// A root llms.txt overrides the one Mintlify would generate.
function llms(index, files) {
  const nav = JSON.parse(readFileSync(resolve(root, 'docs.json'), 'utf8'));
  const front = (page) => {
    const text = files[`${page}.mdx`] ?? readFileSync(resolve(root, `${page}.mdx`), 'utf8');
    const field = (key) => (text.match(new RegExp(`^${key}: "(.*)"$`, 'm')) ?? [])[1];
    return { title: field('title'), description: field('description') };
  };
  const entry = (page, prefix = '') => {
    const { title, description } = front(page);
    assert.ok(title && description, `${page}: frontmatter needs a title and description`);
    // Skip the group prefix when the title already names it ("AI Canvas", "Forge").
    const label = prefix && title.startsWith(prefix.replace(/: $/, '')) ? title : `${prefix}${title}`;
    return `- [${label}](${SITE}/${page}.md): ${description}`;
  };
  // The agent brief is already the first entry under For agents.
  const walk = (group, prefix = '') => group.pages.flatMap(item => typeof item === 'string'
    ? (item === 'mcp/agent-brief' ? [] : [entry(item, prefix)]) : walk(item, `${prefix}${item.group}: `));
  let out = `# ${nav.name}\n\n> ${nav.description}\n\n`;
  out += `These docs describe what Continuum ships today; don't infer features or prices that aren't written here. Product lines are Creative+, Organic+, and Performance+. Publishing, ad and budget changes, live creative swaps, final Forge renders, and deletions wait for the person's yes (Forge \`set_delete\` has no preview, so ask first). New campaigns, ad sets, and ads are created paused. Every page below is markdown (the docs host adds a short index header and a footer to each); drop \`.md\` for the web page.\n\n`;
  out += `## For agents\n\n`;
  out += `- [Agent brief](${SITE}/mcp/agent-brief.md): how an assistant should use the Continuum connector, and how to read these docs.\n`;
  out += `- [MCP tool index (JSON)](${SITE}/mcp/tools.json): all ${index.counts.registered} registered tools with role, connection, confirmation, completion, retry, actions and their inputs, example calls, and errors.\n`;
  out += `- [MCP tool schemas (JSON)](${SITE}/mcp/schemas/paid_manage.json): one file per tool at \`/mcp/schemas/<tool>.json\`, the input schema the server validates against.\n`;
  out += `- [Forge operation index (JSON)](${SITE}/forge/agent-manifest.json): per-action Forge contracts.\n`;
  out += `- [All docs in one file](${SITE}/llms-full.txt): every page below, in full.\n`;
  out += `- [Agent skill](${SITE}/skill.md): the same rules and capabilities as a skill file.\n`;
  out += `- Continuum MCP server: \`https://api.trycontinuum.ai/mcp\` (ChatGPT: \`/mcp/chatgpt\`), OAuth 2.1 with PKCE, no API keys. Call \`help_describe\` for the live schema before calling a tool.\n\n`;
  for (const group of nav.navigation.groups) out += `## ${group.group}\n\n${walk(group).join('\n')}\n\n`;
  return out.trimEnd() + '\n';
}

function refresh(backend, monorepo) {
  const stage = mkdtempSync(join(tmpdir(), 'mcp-docs-'));
  const paths = {};
  for (const name of readdirSync(resolve(monorepo, 'packages'))) {
    const path = resolve(monorepo, 'packages', name, 'package.json');
    if (!existsSync(path)) continue;
    const pkg = JSON.parse(readFileSync(path, 'utf8'));
    const entry = resolve(dirname(path), pkg.main ?? 'src/index.ts');
    if (existsSync(entry)) paths[pkg.name] = [entry];
  }
  const config = join(stage, 'tsconfig.json');
  writeFileSync(config, JSON.stringify({ compilerOptions: { baseUrl: monorepo, paths } }));
  // The server's env schema needs these to import; the export makes no network or database calls.
  const env = Object.fromEntries(['INTEGRATIONS_DOMAIN', 'SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'META_APP_ID', 'META_APP_SECRET'].map(k => [k, 'docs-export']));
  env.SUPABASE_URL = 'http://127.0.0.1:9';
  mkdirSync(dirname(sourcePath), { recursive: true });
  execFileSync('bun', ['--no-env-file', '--tsconfig-override', config, resolve(root, 'scripts/mcp-source.ts'), resolve(backend), sourcePath], {
    cwd: root, stdio: ['ignore', 'inherit', 'inherit'], timeout: 180_000,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === '--refresh') refresh(args[1], args[2]);
  const files = buildOutputs(JSON.parse(readFileSync(sourcePath, 'utf8')));
  if (args[0] === '--check') {
    const drift = Object.entries(files).filter(([path, text]) => !existsSync(resolve(root, path)) || readFileSync(resolve(root, path), 'utf8') !== text);
    if (drift.length) { console.error(`MCP docs drifted from drafts/mcp/source.json: ${drift.map(([p]) => p).join(', ')}. Run node scripts/mcp-docs.mjs`); process.exit(1); }
    console.log(`MCP docs match drafts/mcp/source.json (${Object.keys(files).length} files).`);
  } else {
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(resolve(root, path)), { recursive: true });
      writeFileSync(resolve(root, path), text);
    }
    console.log(`Wrote ${Object.keys(files).length} files.`);
  }
}
