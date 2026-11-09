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
import { areas, codeMeaning, needs } from './mcp-notes.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'drafts/mcp/source.json');
const SITE = 'https://docs.trycontinuum.ai';
// Server text can hold {braces} and <placeholders>, which MDX would parse as code; escape them
// outside inline code spans.
const mdx = (text) => String(text).split(/(`[^`\n]*`)/).map((part, i) => i % 2 ? part
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
const role = (tool) => ROLE[tool.surface.requiresRole] ?? (tool.brandScoped ? 'Any brand member' : 'Anyone signed in');

function errors(tool) {
  const out = new Map(tool.commonErrors.map(e => [e.code, e.reason]));
  const add = (key, text) => { if (!out.has(key)) out.set(key, text); };
  for (const c of tool.errorCodes) {
    assert.ok(codeMeaning[c], `No meaning for ${c} (${tool.name}); add it to scripts/mcp-notes.mjs`);
    add(c, codeMeaning[c]);
  }
  if (tool.brandScoped) add('needs_brand', needs.needs_brand());
  const r = tool.surface.requiresRole;
  if (r && r !== 'viewer') add('needs_role', needs.needs_role(ROLE[r]));
  if (tool.surface.requiresIntegration) add('needs_integration', needs.needs_integration(tool.surface.requiresIntegration));
  if (['two_phase_confirm_token', 'elicitation_or_confirm_token'].includes(tool.facts.confirmation))
    add('CONFIRMATION_REQUIRED', codeMeaning.CONFIRMATION_REQUIRED);
  if (tool.rateLimit) add('RATE_LIMITED', codeMeaning.RATE_LIMITED);
  add('VALIDATION_ERROR', codeMeaning.VALIDATION_ERROR);
  return [...out].map(([c, when]) => ({ code: c, when }));
}

const names = (inputs, required) => inputs.filter(i => i.required === required).map(i => i.name);
function actionRows(tool) {
  return tool.actions.map(a => ({ name: a.name, required: names(a.inputs, true), optional: names(a.inputs, false) }));
}
const codeList = (list, max = 14) => list.length === 0 ? '—'
  : list.slice(0, max).map(code).join(', ') + (list.length > max ? `, and ${list.length - max} more` : '');

const anchor = (name) => name;

function toolSection(tool, oneLiner) {
  const facts = tool.facts;
  const rows = [
    ['Changes things', tool.mutates ? 'Yes' : 'No'],
    ['Listed in your assistant', listed(tool)],
    ['Role', role(tool)],
    ['Needs', [tool.brandScoped ? 'An active brand' : 'No brand', tool.surface.requiresIntegration && `a ${tool.surface.requiresIntegration} connection`].filter(Boolean).join(', ')],
    ['Confirmation', CONFIRMATION[facts.confirmation]],
    ['Completion', EXECUTION[facts.execution]],
    ['Retry', RETRY[facts.idempotency]],
  ];
  if (tool.rateLimit) rows.push(['Rate limit', `${tool.rateLimit.budget} calls per ${tool.rateLimit.windowSeconds / 3600} hour per ${tool.rateLimit.scope}. See [Limits](/mcp/reference#limits).`]);
  let out = `### ${tool.name}\n\n${oneLiner}\n\n| Contract | Behavior |\n| --- | --- |\n`;
  for (const [k, v] of rows) out += `| ${k} | ${cell(v)} |\n`;
  out += `\n**What the server tells your assistant:**\n\n> ${cell(tool.description)}\n\n`;
  if (tool.actions) {
    out += `**Actions** (\`${tool.actionKey}\`):\n\n| ${cell(tool.actionKey)} | Required inputs | Optional inputs |\n| --- | --- | --- |\n`;
    for (const a of actionRows(tool)) out += `| ${code(a.name)} | ${cell(codeList(a.required))} | ${cell(codeList(a.optional))} |\n`;
  } else if (tool.inputs.length) {
    out += `**Inputs:**\n\n| Input | Type | Required | About |\n| --- | --- | --- | --- |\n`;
    for (const i of tool.inputs) out += `| ${code(i.name)} | ${cell(i.type)} | ${i.required ? 'Yes' : 'No'} | ${cell([i.description, i.values && `One of ${i.values.map(code).join(', ')}.`].filter(Boolean).join(' ') || '—')} |\n`;
  } else {
    out += `**Inputs:** none.\n`;
  }
  const example = tool.examples[0];
  out += `\n**Example** (${example.generated ? 'placeholder values: substitute IDs returned by earlier calls' : cell(example.title)}):\n\n\`\`\`json\n${JSON.stringify({ name: tool.name, arguments: example.arguments }, null, 2)}\n\`\`\`\n\n`;
  out += `**Errors and statuses:**\n\n| Code | When |\n| --- | --- |\n`;
  for (const e of errors(tool)) out += `| ${code(e.code)} | ${cell(e.when)} |\n`;
  if (tool.relatedTools.length) out += `\n**Related:** ${tool.relatedTools.map(code).join(', ')}.\n`;
  const schemaCall = tool.actions ? `{"tool":"${tool.name}","action":"<${tool.actionKey}>"}` : `{"tool":"${tool.name}"}`;
  out += `\nFull schema: \`help_describe ${schemaCall}\`.\n\n`;
  return out;
}

export function buildOutputs(source) {
  const advertised = source.tools.filter(t => t.state === 'advertised');
  const internal = source.tools.filter(t => t.state === 'internal');
  const byName = new Map(source.tools.map(t => [t.name, t]));
  const mapped = areas.flatMap(a => Object.keys(a.tools));
  assert.deepEqual([...mapped].sort(), advertised.map(t => t.name).sort(), 'Advertised tools drifted: update areas in scripts/mcp-notes.mjs');
  assert.equal(source.helpIndex.length, source.counts.registered, 'help_describe index and registry counts differ');
  const header = `{/* Generated by scripts/mcp-docs.mjs from drafts/mcp/source.json; edit scripts/mcp-notes.mjs instead. */}\n`;
  const checked = `Generated from the server's registry at continuum-backend \`${source.backend.revision.slice(0, 9)}\` (${source.backend.date}).`;
  const files = {};

  for (const area of areas) {
    let page = `---\ntitle: "${area.title}"\nsidebarTitle: "${area.sidebarTitle}"\ndescription: "${area.description}"\n---\n\n${header}\n`;
    page += `${checked} Every section lists what the tool needs, whether it waits for a yes, how it completes, each action's inputs, a valid example call, and the errors it can return. Before you call a tool, fetch its live schema with \`help_describe\`; if the server and this page disagree, the server wins. The **What the server tells your assistant** blocks quote the server word for word, so they can use internal names, such as \"AI Studio\" for the AI Canvas.\n\n`;
    page += `| Tool | What it does | Changes things |\n| --- | --- | --- |\n`;
    for (const [name, line] of Object.entries(area.tools))
      page += `| [${code(name)}](#${anchor(name)}) | ${cell(line)} | ${byName.get(name).mutates ? 'Yes' : 'No'} |\n`;
    page += `\n`;
    for (const [name, line] of Object.entries(area.tools)) page += toolSection(byName.get(name), line);
    const others = areas.filter(a => a !== area).slice(0, 3);
    page += `## What's next\n\n<CardGroup cols={2}>\n<Card title="All tools" icon="toolbox" href="/mcp/tools">Every tool on one page, and the machine-readable index.</Card>\n`;
    for (const o of others) page += `<Card title="${o.title}" icon="arrow-right" href="/mcp/tools/${o.slug}">${o.tools[Object.keys(o.tools)[0]].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').split('.')[0]}, and more.</Card>\n`;
    page += `</CardGroup>\n`;
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
  for (const t of internal)
    overview += `| ${code(t.name)} | ${cell(t.summary)}${unbuilt(t) ? ' **Not available yet:** it returns `NOT_IMPLEMENTED`.' : ''} | ${t.mutates ? 'Yes' : 'No'} |\n`;
  overview += `\n## Ready-made prompts\n\nThe connector also offers three prompts your assistant may list in its menu:\n\n| Prompt | What it does |\n| --- | --- |\n| \`analytics-weekly-review\` | A weekly review across social and ads. |\n| \`analytics-top-and-bottom-posts\` | Your best and worst organic posts, and why. |\n| \`analytics-top-and-bottom-ads\` | Your best and worst ads, and why. |\n\n`;
  overview += `## What's next\n\n<CardGroup cols={2}>\n<Card title="Agent brief" icon="robot" href="/mcp/agent-brief">How an assistant should use these tools.</Card>\n<Card title="Server reference" icon="server" href="/mcp/reference">Endpoints, sign-in, confirmations, result codes, and limits.</Card>\n</CardGroup>\n`;
  files['mcp/tools.mdx'] = overview;

  const areaOf = new Map(areas.flatMap(a => Object.keys(a.tools).map(n => [n, a])));
  const index = {
    version: 1,
    source: { ...source.backend, generator: 'scripts/mcp-docs.mjs' },
    server: { url: 'https://api.trycontinuum.ai/mcp', chatgpt: 'https://api.trycontinuum.ai/mcp/chatgpt', auth: 'OAuth 2.1 with PKCE; no API keys' },
    discovery: { name: 'help_describe', arguments: { tool: '<name>', action: '<action>' }, note: 'The live schema wins over this index.' },
    counts: { registered: source.counts.registered, listed: advertised.length, notListed: internal.length },
    docs: { overview: `${SITE}/mcp/tools`, agentBrief: `${SITE}/mcp/agent-brief`, serverReference: `${SITE}/mcp/reference` },
    tools: source.tools.map(t => {
      const area = areaOf.get(t.name);
      return {
        name: t.name,
        listed: t.state === 'advertised',
        ...(unbuilt(t) ? { available: false } : {}),
        ...(area ? { area: area.slug, docs: `${SITE}/mcp/tools/${area.slug}#${anchor(t.name)}`, summary: area.tools[t.name].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') } : { summary: t.summary }),
        mutates: t.mutates,
        role: t.surface.requiresRole ?? null,
        integration: t.surface.requiresIntegration ?? null,
        brandScoped: t.brandScoped,
        confirmation: t.facts?.confirmation ?? null,
        completion: t.facts?.execution ?? null,
        retry: t.facts?.idempotency ?? null,
        rateLimit: t.rateLimit,
        inputs: Object.fromEntries((t.actions ? t.actions.flatMap(a => a.inputs) : t.inputs)
          .map(({ name, required, ...about }) => [name, about])),
        ...(t.actions ? {
          actionKey: t.actionKey,
          actions: t.actions.map(a => ({ name: a.name, required: names(a.inputs, true), optional: names(a.inputs, false) })),
        } : { required: names(t.inputs, true) }),
        example: t.examples[0] ? { arguments: t.examples[0].arguments, placeholder: Boolean(t.examples[0].generated) } : null,
        errors: t.facts ? errors(t) : t.commonErrors.map(e => ({ code: e.code, when: e.reason })),
        related: t.relatedTools,
      };
    }),
  };
  files["mcp/tools.json"] = `${JSON.stringify(index)}\n`;
  return files;
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
