// Run only through `node scripts/mcp-docs.mjs --refresh <backend>`; never start the application.
// Exports the registered MCP tool catalog exactly as help_describe serves it.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const [backendArg, output] = process.argv.slice(2);
if (!backendArg || !output) throw new Error('Expected backend, output');
const backend = resolve(backendArg);
globalThis.fetch = (() => { throw new Error('Network forbidden during MCP schema export'); }) as typeof fetch;
const { buildManifest } = await import(resolve(backend, 'App/mcp/manifest.ts'));
const { serializeToolSpec, serializeActionSchema, discriminatorValuesForSchema } =
  await import(resolve(backend, 'App/mcp/shared/serializeToolSpec.ts'));
const help = await import(resolve(backend, 'App/mcp/tools/help.describe.ts'));
const { examples: reviewedExamples } = await import(resolve(import.meta.dir, 'mcp-notes.mjs'));
const { TOOL_RATE_POLICIES } = await import(resolve(backend, 'App/mcp/shared/toolRateLimit.ts'));

const manifest = await buildManifest();
const registered = manifest.tools.filter((t: { state: string }) => t.state === 'advertised' || t.state === 'internal');
const specs = new Map();
for (const entry of registered) {
  const { default: spec } = await import(resolve(backend, `App/mcp/tools/${entry.module}.ts`));
  specs.set(spec.name, spec);
}
help.setHelpRegistry({ list: () => [...specs.values()], get: (name: string) => specs.get(name) });
const call = async (input: object) => (await help.helpDescribeTool.handler(input, {})).data.tools;

const MAX_ENUM = 40;
const clip = (text: string | undefined, n = 160) => {
  const one = (text ?? '').replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n - 1)}…` : one;
};
// One row per input: name, type, required, allowed values, description. Nested `params`
// objects are flattened one level (`params.mode`) because umbrella tools put inputs there.
function fields(schema: any, prefix = '', skip?: string): any[] {
  if (!schema || typeof schema !== 'object') return [];
  // A narrowed action schema arrives wrapped as { oneOf: [branch] }.
  const branches = schema.oneOf ?? schema.anyOf;
  if (!schema.properties && branches?.length === 1) return fields(branches[0], prefix, skip);
  const required = new Set(schema.required ?? []);
  const rows = [];
  for (const [name, prop] of Object.entries<any>(schema.properties ?? {})) {
    if (name === skip) continue;
    const kind = (b: any) => b.type ?? (b.const !== undefined ? typeof b.const : b.properties ? 'object' : b.items ? 'array' : 'any');
    const branches = prop.oneOf ?? prop.anyOf;
    const type = prop.type ?? (branches ? [...new Set(branches.flatMap((b: any) => [kind(b)].flat()))].join('|') : prop.const !== undefined ? typeof prop.const : 'any');
    const values = prop.enum ?? (prop.const !== undefined ? [prop.const] : undefined);
    const row: any = { name: prefix + name, type: Array.isArray(type) ? type.join('|') : type, required: required.has(name) };
    if (values) row.values = values.slice(0, MAX_ENUM).map(String).concat(values.length > MAX_ENUM ? ['…'] : []);
    if (prop.description) row.description = clip(prop.description);
    rows.push(row);
    if (!prefix && name === 'params' && prop.properties) rows.push(...fields(prop, 'params.'));
    if (!prefix && name === 'params' && (prop.oneOf || prop.anyOf)) {
      const ops = (prop.oneOf ?? prop.anyOf).map((b: any) => b.properties?.op?.const).filter(Boolean);
      if (ops.length) row.values = ops;
    }
  }
  return rows;
}

// A placeholder call for tools help_describe has no example for. It must pass the tool's own
// validator, or the export fails and the example has to be written by hand in mcp-notes.mjs.
const UUID = '11111111-1111-4111-8111-111111111111';
function placeholder(schema: any, name = ''): any {
  if (!schema || typeof schema !== 'object') return 'example';
  if (schema.const !== undefined) return schema.const;
  if (schema.enum) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;
  const branch = schema.oneOf ?? schema.anyOf;
  if (branch) return placeholder(branch[0], name);
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === 'object' || schema.properties) {
    const out: Record<string, unknown> = {};
    for (const key of schema.required ?? []) out[key] = placeholder(schema.properties?.[key], key);
    return out;
  }
  if (type === 'array') return Array.from({ length: Math.max(1, schema.minItems ?? 1) }, () => placeholder(schema.items, name));
  if (type === 'integer' || type === 'number') return Math.max(1, schema.minimum ?? (schema.exclusiveMinimum ?? 0) + 1);
  if (type === 'boolean') return false;
  if (schema.format === 'uuid') return UUID;
  if (schema.format === 'date') return '2026-11-01';
  if (schema.format === 'date-time') return '2026-11-01T00:00:00Z';
  if (schema.format === 'uri' || schema.format === 'url' || /url$/i.test(name)) return 'https://example.com/page';
  if (schema.pattern === '^\\d+$') return '1234567890';
  if (schema.pattern === '^[\\d-]+$') return '123-456-7890';
  const hex = /^\^\[0-9a-f\]\{(\d+)\}\$$/.exec(schema.pattern ?? '');
  if (hex) return 'a'.repeat(Number(hex[1]));
  const text = /(^|_)id$|Id$/.test(name) ? `${name}_123` : `<${name || 'value'}>`;
  return schema.minLength && text.length < schema.minLength ? text.padEnd(schema.minLength, 'x') : text;
}
function generatedExample(spec: any, full: any, discriminator: any) {
  const branches = discriminator
    ? discriminator.values.map((action: string) => serializeActionSchema(spec, action))
    : [full.inputSchema];
  for (const branch of branches) {
    const args = placeholder(branch);
    if (spec.inputSchema.safeParse(args).success) {
      const label = discriminator ? `${discriminator.key}=${args[discriminator.key]}` : 'minimal call';
      return { title: `Minimal valid call (${label})`, arguments: args, generated: true };
    }
  }
  return null;
}
// Reviewed examples (mcp-notes.mjs) first, then the server's own examples that pass the tool's
// validator and name only registered tools. A placeholder call is the last resort.
const rejected: string[] = [];
const valid = (spec: any, args: any) => spec.inputSchema.safeParse(args).success
  && (spec.name !== 'help_describe' || !args.tool || specs.has(args.tool));
function examplesFor(spec: any, full: any, discriminator: any, server: any[]) {
  const reviewed = reviewedExamples[spec.name] ?? [];
  for (const e of reviewed) if (!valid(spec, e.arguments)) rejected.push(`${spec.name} ${e.title}: ${
    spec.inputSchema.safeParse(e.arguments).error?.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ') ?? 'unknown tool'}`);
  const out = [...reviewed, ...server.filter(e => valid(spec, e.arguments))];
  return out.length ? out : [generatedExample(spec, full, discriminator)].filter(Boolean);
}
const moduleByName = new Map(manifest.tools.map((t: { name: string; module: string }) => [t.name, t.module]));
const moduleOf = (name: string) => moduleByName.get(name) as string;

// Error codes the tool's own module can return. Framework outcomes (brand, role, integration,
// rate limit) are added by mcp-docs.mjs from the tool's surface and facts.
const codesIn = (module: string) => [...new Set(
  [...readFileSync(resolve(backend, `App/mcp/tools/${module}.ts`), 'utf8')
    .matchAll(/toolError\(\s*['"]([A-Z_]+)['"]/g)].map(m => m[1]))].sort();

// Some umbrella tools take one flat input object for every action and enforce each action's
// requirements in the validator. Probe that validator to learn what each action really requires.
function probeRequired(spec: any, schema: any, key: string, action: string): string[] {
  const args: Record<string, unknown> = { [key]: action };
  const required: string[] = [];
  for (let i = 0; i < 10; i++) {
    const parsed = spec.inputSchema.safeParse(args);
    if (parsed.success) return required;
    const missing = [...new Set(parsed.error.issues.map((x: any) => x.path[0])
      .filter((name: any) => typeof name === 'string' && args[name] === undefined && schema.properties?.[name]))] as string[];
    if (!missing.length) return required;
    for (const name of missing) { required.push(name); args[name] = placeholder(schema.properties[name], name); }
  }
  return required;
}

const index = await call({});
const tools = [];
for (const entry of registered) {
  const spec = specs.get(entry.name);
  const [described] = await call({ tool: entry.name });
  const full = serializeToolSpec(spec);
  const discriminator = discriminatorValuesForSchema(full.inputSchema);
  // Flat: every action's narrowed schema is the whole input object.
  const flat = Boolean(discriminator) && discriminator.values.every((action: string) =>
    JSON.stringify(serializeActionSchema(spec, action)) === JSON.stringify(full.inputSchema));
  const actions = discriminator
    ? discriminator.values.map((action: string) => {
        if (!flat) return { name: action, inputs: fields(serializeActionSchema(spec, action)) };
        const required = new Set([discriminator.key, ...probeRequired(spec, full.inputSchema, discriminator.key, action)]);
        return { name: action, inputs: fields(full.inputSchema).filter((i: any) => !i.name.includes('.'))
          .map((i: any) => ({ ...i, required: required.has(i.name) })) };
      })
    : null;
  tools.push({
    name: entry.name,
    state: entry.state,
    summary: entry.summary,
    description: described.description,
    surface: entry.surface,
    annotations: entry.annotations,
    brandScoped: entry.brandScoped,
    mutates: entry.mutates,
    facts: entry.facts,
    ...(entry.delegates ? { delegates: entry.delegates } : {}),
    delegateIntegrations: [...new Set((entry.delegates ?? [])
      .map((name: string) => manifest.tools.find((t: any) => t.name === name)?.surface.requiresIntegration).filter(Boolean))].sort(),
    actionKey: discriminator?.key ?? null,
    flat,
    inputSchema: full.inputSchema,
    ...(actions ? { actions } : { inputs: fields(full.inputSchema) }),
    examples: examplesFor(spec, full, discriminator, described.examples ?? []),
    errorCodes: [...new Set([entry.module, ...(entry.delegates ?? []).map(moduleOf)].flatMap(codesIn))].sort(),
    rateLimit: TOOL_RATE_POLICIES[entry.name] ?? null,
    commonErrors: described.common_errors ?? [],
    relatedTools: (described.related_tools ?? []).filter((name: string) => specs.has(name)),
  });
}
if (rejected.length) throw new Error(`Reviewed examples rejected by the tool's validator:\n${rejected.join('\n')}`);
const git = (...args: string[]) => execFileSync('git', ['-C', backend, ...args], { encoding: 'utf8' }).trim();
writeFileSync(output, JSON.stringify({
  backend: { repository: 'Continuum-AI-Agency/continuum-backend', revision: git('rev-parse', 'HEAD'), date: git('log', '-1', '--format=%cs') },
  counts: manifest.counts,
  helpIndex: index.map((t: { name: string }) => t.name),
  tools,
}, null, 2) + '\n');
