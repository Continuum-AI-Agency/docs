#!/usr/bin/env node
// Builds llms-full.txt: every page in navigation order, as the markdown agents read, with absolute
// links. A root llms-full.txt replaces the one Mintlify would generate, so rebuild it after any page
// edit, with `mint dev` running:  node scripts/llms-full.mjs http://localhost:3000
// tests/forge-docs.test.mjs fails when a page's title, description, or headings drift from this file.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://docs.trycontinuum.ai';
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const nav = JSON.parse(readFileSync(resolve(root, 'docs.json'), 'utf8'));
const flatten = (group) => group.pages.flatMap(p => typeof p === 'string' ? [p] : flatten(p));
const pages = nav.navigation.groups.flatMap(flatten);
const known = new Set(pages);

// Root-relative links become absolute, and links to pages point at their markdown.
const absolute = (md) => md.replace(/\]\((\/[^)\s]*)\)/g, (_, path) => {
  const [route, hash] = path.split('#');
  const page = route.slice(1).replace(/\.md$/, '') || 'index';
  const target = known.has(page) ? `${SITE}/${page}.md` : `${SITE}${route}`;
  return `](${target}${hash ? `#${hash}` : ''})`;
});

let out = `# ${nav.name}\n\n> ${nav.description}\n\nEvery page of the Continuum docs in navigation order, as markdown. Each section starts with the page title and its source. The page map is [llms.txt](${SITE}/llms.txt).\n`;
for (const page of pages) {
  const response = await fetch(`${base}/${page}.md`);
  assert.equal(response.status, 200, `${page}.md returned ${response.status}`);
  const md = await response.text();
  const start = md.search(/^# /m);
  assert.ok(start >= 0, `${page}.md has no title`);
  const body = md.slice(start)
    .replace(/\n*This documentation is built and hosted on \[Mintlify\][^\n]*\n*$/, '\n')
    .trim();
  for (const noise of ['parsing error', 'theme={', '[card]']) assert.ok(!body.includes(noise), `${page}: ${noise}`);
  const [title, ...rest] = body.split('\n');
  out += `\n${title}\n\nSource: ${SITE}/${page}\n\n${absolute(rest.join('\n').trim())}\n`;
}
writeFileSync(resolve(root, 'llms-full.txt'), out);
console.log(`Wrote llms-full.txt: ${pages.length} pages, ${out.length} bytes.`);
