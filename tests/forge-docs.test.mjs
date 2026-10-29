import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { buildOutputs, root } from '../scripts/forge-docs.mjs';

const read = path => readFileSync(resolve(root, path), 'utf8');
const parse = path => JSON.parse(read(path));
const source = parse('drafts/forge/source.json');
const lock = parse('drafts/forge/sources.lock.json');
const index = parse('forge/agent-manifest.json');
const nav = parse('docs.json');
const publicPages = ['forge/agents', 'forge/functions', 'forge/design-systems'];
const flatten = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(flatten)
  : value && typeof value === 'object' ? Object.values(value).flatMap(flatten) : [];
const pages = flatten(nav.navigation).filter(path => existsSync(resolve(root, `${path}.mdx`)));

test('all source actions are covered once, including requirements validated by the real schemas', () => {
  const expected = source.tools.flatMap(t => t.actions.map(a => `${t.name}.${a}`)).sort();
  assert.deepEqual(index.operations.map(o => o.id).sort(), expected);
  assert.equal(new Set(expected).size, expected.length);
  assert.deepEqual(source.validations.map(v => v.id).sort(), expected);
  assert.ok(source.validations.every(v => v.inputAccepted && v.missingRequiredRejected.includes('action')));
  assert.ok(source.negativeExamplesRejected >= 6);
  assert.deepEqual(parse('drafts/forge/examples.json').map(x => `${x.name}.${x.arguments.action}`).sort(), expected);
  for (const tool of source.tools) {
    const schema = parse(tool.schema.path);
    assert.deepEqual(schema.inputSchema.properties.action.enum, tool.actions);
    assert.equal(createHash('sha256').update(read(tool.schema.path)).digest('hex'), tool.schema.sha256);
  }
});

test('generation is deterministic and detects removed or undocumented actions', () => {
  const first = buildOutputs(source, lock);
  assert.deepEqual(first, buildOutputs(source, lock));
  for (const [path, content] of first) assert.equal(read(path), content, path);
  const changed = structuredClone(source);
  changed.tools[0].actions.push('undocumented_action');
  assert.throws(() => buildOutputs(changed, lock), /Action coverage drift/);
  const removed = structuredClone(source);
  removed.tools[0].actions.pop();
  assert.throws(() => buildOutputs(removed, lock), /Action coverage drift/);
});

test('navigation and root-relative links reach existing public pages or static assets', () => {
  for (const page of publicPages) assert.ok(pages.includes(page), `Missing navigation: ${page}`);
  for (const page of publicPages.concat('mcp/agent-brief', 'mcp/tools', 'forge/overview')) {
    const text = read(`${page}.mdx`);
    const links = [...text.matchAll(/(?:href="|\]\()(\/[^"\s)]*)/g)].map(m => m[1]);
    for (const link of links) {
      const path = link.split('#')[0].split('?')[0].slice(1);
      assert.ok(existsSync(resolve(root, path)) || existsSync(resolve(root, `${path}.mdx`)), `${page}: ${link}`);
    }
  }
});

test('internal schemas, evidence and named recipes cannot enter navigation or public links', () => {
  const ignore = read('.mintignore').split('\n').map(x => x.trim());
  for (const path of ['drafts/', '*.draft.mdx', '.cache/', 'scripts/', 'tests/']) assert.ok(ignore.includes(path), path);
  assert.ok(!flatten(nav.navigation).some(x => /drafts\/|\.draft\.|scripts\/|tests\//.test(x)));
  for (const page of pages) {
    const text = read(`${page}.mdx`);
    assert.doesNotMatch(text, /AIM World|Previz|\/drafts\/forge|sources\.lock\.json|002d2d68|e5662d7a/);
  }
  assert.doesNotMatch(read('forge/agent-manifest.json'), /AIM World|Previz|\/drafts\/|\.cache\//);
});

test('quickstart and index stay bounded, with lazy action discovery', () => {
  // A conservative character budget catches manual growth without adding a tokenizer dependency.
  assert.ok(read('forge/agents.mdx').length <= 6_200, 'Quickstart exceeds its compact character budget');
  assert.ok(Buffer.byteLength(read('forge/agent-manifest.json')) <= 20_000, 'Operation index grew beyond 20 KB');
  assert.equal(read('forge/agent-manifest.txt'), read('forge/agent-manifest.json'));
  for (const page of ['forge/agents', 'forge/functions'])
    assert.match(read(`${page}.mdx`), /\[operation index\]\(\/forge\/agent-manifest\.json\)/);
  assert.match(read('forge/agents.mdx'), /help_describe/);
  assert.ok(source.documentedExamples.some(x => x.page === 'forge/agents.mdx'));
  assert.ok(source.documentedExamples.filter(x => x.page.includes('integration-recipes')).length >= 19);
  assert.ok(source.examplePageHashes['forge/agents.mdx']);
});

test('recovery and execution boundaries remain explicit', () => {
  const text = read('forge/functions.mdx');
  for (const phrase of ['expectedRevision', 'bindingId', 'needs_role', 'Expired or spent token',
    'details.overrides', 'done=true', 'confirmationToken', 'no render_preview token']) assert.ok(text.includes(phrase), phrase);
  for (const op of ['template_forge', 'render_confirm', 'scene_render', 'set_delete'])
    assert.ok(index.operations.find(x => x.id === `forge_manage.${op}`)?.confirmation);
  assert.equal(index.operations.find(x => x.id === 'forge_manage.template_save').maySpend, true);
  assert.equal(index.operations.find(x => x.id === 'forge_manage.source_begin').continuationMaySpend, true);
  assert.match(read('forge/agents.mdx'), /Before uploading or saving/);
  assert.match(read('forge/agents.mdx'), /not an immutable-version guarantee/);
  assert.match(read('forge/design-systems.mdx'), /Upload → parse → edit → preview → render → export/);
  assert.ok(source.templateFamilies.every(family => parse('drafts/forge/inventory.json').templateFamilies.includes(family)));
  assert.equal(parse('drafts/forge/inventory.json').availability.callableMutations, 'UNRUN');
});

test('public call sequences use exactly the examples validated against the real input schemas', () => {
  const validated = parse('drafts/forge/recipes.json');
  const sequences = [...read('forge/functions.mdx').matchAll(/```json\n([\s\S]*?)\n```/g)];
  assert.equal(sequences.length, 3);
  sequences.forEach(([, text], i) => assert.deepEqual(JSON.parse(text), validated[i].calls));
  assert.deepEqual(source.validatedRecipeCalls, validated.map(recipe => ({ title: recipe.title, calls: recipe.calls.length })));
  const sourceCalls = validated[1].calls.map(call => call.arguments);
  assert.equal(sourceCalls.find(a => a.action === 'template_layers').revisionId,
    sourceCalls.find(a => a.action === 'template_save').parentRevisionId);
  assert.notEqual(sourceCalls.find(a => a.action === 'template_tree').assetId,
    sourceCalls.find(a => a.action === 'template_run').assetId);
  assert.equal(sourceCalls.find(a => a.action === 'template_run').assetId,
    sourceCalls.find(a => a.action === 'template_forge').assetId);
  assert.match(validated[1].identities, /CONDITIONAL/);
});
