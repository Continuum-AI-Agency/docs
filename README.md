# Continuum Docs

Documentation site for [Continuum](https://trycontinuum.ai) — the creative factory for performance marketers, designers, and agencies.

Built with [Mintlify](https://mintlify.com).

## Local development

```bash
npm i -g mint
mint dev
```

Preview at `http://localhost:3000`. The site is dark by default; check pages in light mode too.

## Structure

```
├── index.mdx               # Home
├── quickstart.mdx          # Connect your AI assistant + first five minutes
├── concepts.mdx, glossary.mdx
├── mcp/                    # Continuum in your AI assistant (MCP): connect, use cases, control, tools
│   └── use-cases/          # One page per job (performance, social, ads, creative, video, templates…)
├── canvas/                 # Creative+: AI Canvas, nodes, models, workflows, pipelines, elements, Library
│   └── nodes/
├── forge/                  # Creative+: Forge agent guide, functions, formats, and AE delivery
├── organic/                # Organic+: Organic agent, Calendar, publishing, analytics
├── performance/            # Performance+: Jaina, Optimizer, analytics, DCO, approvals
├── brand/                  # Brand setup, brand book, readiness, Brand Spy
├── settings/               # Roles, connections & activity, knowledge, billing
├── integrations.mdx, security.mdx, changelog.mdx, troubleshooting.mdx
├── docs.json               # Mintlify configuration (navigation, theme, redirects)
├── style.css               # trycontinuum.ai brand layer
├── fonts/, logo/           # Self-hosted fonts and logos
└── AGENTS.md               # Authoring conventions
```

## Authoring

Read [`AGENTS.md`](AGENTS.md) for terminology, style, and the rule that every new page must be
registered in `docs.json` (with a `redirects` entry when a page moves).

Forge's source-derived reference has a dependency-free check:

```bash
node scripts/forge-docs.mjs --check
node --test tests/forge-docs.test.mjs
```

These check the committed, pinned export; they do not call production. Refresh instructions,
full schemas and integration evidence are in [the excluded internal map](drafts/forge/README.md).

## Deployment

Push to the default branch. The Mintlify GitHub app auto-deploys changes.

## Need help?

- Run `mint broken-links` to check for broken links
- Run `mint update` to get the latest CLI version
- [Mintlify docs](https://mintlify.com/docs)
