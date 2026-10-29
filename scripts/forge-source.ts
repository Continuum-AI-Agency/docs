// Run only through forge-docs.mjs --refresh; never start the application or call a handler.
import { mock } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { operationNote, queryNotes, manageNotes, recipes } from './forge-notes.mjs';

const [backendArg, monorepoArg, output] = process.argv.slice(2);
if (!backendArg || !monorepoArg || !output) throw new Error('Expected backend, monorepo, output');
const backend = resolve(backendArg);
const monorepo = resolve(monorepoArg);
globalThis.fetch = (() => { throw new Error('Network forbidden during Forge schema export'); }) as typeof fetch;
mock.module(resolve(backend, 'App/integrations-ts/src/db.ts'), () => ({
  getBrandIntegrationTokens: () => { throw new Error('Database forbidden during schema export'); },
}));
const { buildManifest } = await import(resolve(backend, 'App/mcp/manifest.ts'));
const { serializeToolSpec, discriminatorValuesForSchema } =
  await import(resolve(backend, 'App/mcp/shared/serializeToolSpec.ts'));
const manifest = await buildManifest();
const tools = [];
const validations = [];
const specs = new Map();
for (const module of ['forge.query', 'forge.manage']) {
  const { default: spec } = await import(resolve(backend, `App/mcp/tools/${module}.ts`));
  specs.set(spec.name, spec);
  const full = serializeToolSpec(spec);
  const discriminator = discriminatorValuesForSchema(full.inputSchema);
  if (!discriminator || discriminator.key !== 'action') throw new Error(`Missing actions: ${spec.name}`);
  const actions = discriminator.values;
  const reviewed = Object.keys(spec.name === 'forge_query' ? queryNotes : manageNotes).sort();
  if (JSON.stringify([...actions].sort()) !== JSON.stringify(reviewed))
    throw new Error(`Action coverage drift: ${spec.name}; review added/removed actions`);
  for (const action of actions) {
    const note = operationNote(spec.name, action);
    const parsed = spec.inputSchema.safeParse(note.args);
    if (!parsed.success) throw new Error(`${spec.name}.${action}: ${parsed.error.message}`);
    for (const required of ['action', ...note.required]) {
      const missing = { ...note.args };
      delete missing[required];
      if (spec.inputSchema.safeParse(missing).success)
        throw new Error(`Reviewed requirement is not enforced: ${spec.name}.${action}.${required}`);
    }
    if (['template_preview', 'template_save'].includes(action)) {
      const contracts = await import(resolve(monorepo, 'packages/contracts/src/index.ts'));
      contracts.templateRevisionEditsSchema.parse(note.args.edits);
    }
    validations.push({ id: `${spec.name}.${action}`, inputAccepted: true, missingRequiredRejected: ['action', ...note.required] });
  }
  tools.push({
    ...full,
    manifest: manifest.tools.find((entry: { name: string }) => entry.name === spec.name),
    actions,
  });
}
const formats = await import(resolve(monorepo, 'packages/contracts/src/media/asset-formats.ts'));
const contracts = await import(resolve(monorepo, 'packages/contracts/src/index.ts'));
const negativeExamples = [
  ['forge_manage', { action: 'suggest_rows', setId: '11111111-1111-4111-8111-111111111111' }],
  ['forge_manage', { action: 'template_save', ...manageNotes.template_save.args, variantId: '11111111-1111-4111-8111-111111111111' }],
  ['forge_manage', { action: 'rows_patch', setId: '11111111-1111-4111-8111-111111111111', expectedRevision: 0 }],
  ['forge_manage', { action: 'render_confirm', confirmationToken: '' }],
  ['forge_query', { action: 'batch', batchId: '11111111-1111-4111-8111-111111111111', waitSeconds: 56 }],
  ['forge_query', { action: 'set_diff', setId: '11111111-1111-4111-8111-111111111111' }],
];
for (const [name, args] of negativeExamples) {
  if (specs.get(name).inputSchema.safeParse(args).success)
    throw new Error(`Invalid documentation example unexpectedly accepted: ${JSON.stringify(args)}`);
}
const documentedExamples = [];
for (const recipe of recipes) for (const call of recipe.calls) {
  specs.get(call.name).inputSchema.parse(call.arguments);
  if (call.arguments.edits) contracts.templateRevisionEditsSchema.parse(call.arguments.edits);
}
for (const page of ['forge/agents.mdx', 'drafts/forge/integration-recipes.md']) {
  const markdown = readFileSync(resolve(import.meta.dir, '..', page), 'utf8');
  for (const match of markdown.matchAll(/```json\n([\s\S]*?)\n```/g)) {
    const value = JSON.parse(match[1]);
    for (const call of Array.isArray(value) ? value : [value]) {
      if (call.name === 'help_describe') {
        const { default: help } = await import(resolve(backend, 'App/mcp/tools/help.describe.ts'));
        help.inputSchema.parse(call.arguments);
      } else {
        const spec = specs.get(call.name);
        if (!spec) throw new Error(`Unknown documented tool: ${call.name}`);
        spec.inputSchema.parse(call.arguments);
        if (call.arguments.edits) contracts.templateRevisionEditsSchema.parse(call.arguments.edits);
      }
      documentedExamples.push({ page, tool: call.name, action: call.arguments.action ?? null });
    }
  }
}
const revision = (path: string) => execFileSync('git', ['-C', path, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const fingerprints = (root: string, paths: string[]) => Object.fromEntries(paths.map(path =>
  [path, createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')]));
writeFileSync(output, JSON.stringify({
  backendRevision: revision(backend),
  monorepoRevision: revision(monorepo),
  tools,
  validations,
  negativeExamplesRejected: negativeExamples.length,
  notesSha256: createHash('sha256').update(readFileSync(resolve(import.meta.dir, 'forge-notes.mjs'))).digest('hex'),
  documentedExamples,
  validatedRecipeCalls: recipes.map(recipe => ({ title: recipe.title, calls: recipe.calls.length })),
  examplePageHashes: Object.fromEntries(['forge/agents.mdx', 'drafts/forge/integration-recipes.md'].map(page =>
    [page, createHash('sha256').update(readFileSync(resolve(import.meta.dir, '..', page))).digest('hex')])),
  runtime: { bun: Bun.version, zod: JSON.parse(readFileSync(import.meta.resolve('zod/package.json').replace('file://', ''))).version },
  fingerprints: {
    backend: fingerprints(backend, ['App/Index.ts', 'App/mcp/manifest.ts', 'App/mcp/tools/forge.query.ts',
      'App/mcp/tools/forge.manage.ts', 'App/mcp/tools/help.describe.ts', 'App/mcp/shared/serializeToolSpec.ts',
      'App/mcp/shared/forgeRenders.ts', 'App/ai-studio/templates/sceneFill.ts', 'App/ai-studio/templates/service.ts',
      'App/ai-studio/api-renders/service.ts', 'App/ai-studio/api-renders/preflightToken.ts',
      'App/ai-studio/templates/templateRevisionEdits.ts', 'App/ai-studio/hyperframes-agent/aepExport.ts',
      'App/ai-studio/templates/initialPreparation.ts', 'App/ai-studio/templates/forgeAutopilot.ts',
      'App/ai-studio/templates/routes.ts',
      'App/mcp/tools/cad.query.ts', 'App/mcp/tools/cad.manage.ts']),
    monorepo: fingerprints(monorepo, ['packages/contracts/src/media/asset-formats.ts',
      'packages/contracts/src/media/template-source.ts', 'docs/capability-matrix-external.md',
      'docs/capability-matrix.md', 'docs/mcp-user-guide.md']),
  },
  formats: formats.LIBRARY_FORMATS,
  zipFormats: formats.LIBRARY_ZIP_FORMATS,
  templateFamilies: contracts.templateSourceFamilySchema.options,
}, null, 2) + '\n');
