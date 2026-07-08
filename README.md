# Continuum Docs

Documentation site for [Continuum](https://trycontinuum.ai) — the AI creative operations platform.

Built with [Mintlify](https://mintlify.com).

## Local development

```bash
npm i -g mint
mint dev
```

Preview at `http://localhost:3000`.

## Structure

```
├── index.mdx               # Home / landing
├── quickstart.mdx          # Onboarding guide
├── concepts.mdx            # Core concepts
├── integrations.mdx        # Connecting channels
├── studio/                 # AI Studio
│   ├── overview.mdx
│   ├── canvas.mdx
│   ├── workflows.mdx
│   ├── library.mdx
│   └── after-effects/      # Client After Effects delivery guide
├── organic/                # Organic social
│   ├── overview.mdx
│   ├── agent.mdx
│   ├── calendar.mdx
│   └── analytics.mdx
├── scale/                  # Paid media
│   ├── overview.mdx
│   ├── jaina.mdx
│   ├── analytics.mdx
│   ├── optimization.mdx
│   ├── dco.mdx
│   ├── approvals.mdx
│   └── campaign-canvas.mdx
├── brand/                  # Brand book & competitor intel
│   ├── overview.mdx
│   ├── readiness.mdx
│   └── spy.mdx
├── settings/               # Account & settings
│   ├── roles.mdx
│   ├── knowledge.mdx
│   └── billing.mdx
├── glossary.mdx            # Resources
├── changelog.mdx
├── troubleshooting.mdx
├── security.mdx
├── docs.json               # Mintlify configuration
├── AGENTS.md               # Authoring conventions
└── logo/                   # Brand logos
```

## Authoring

Read [`AGENTS.md`](AGENTS.md) for terminology, style, and the rule that every new page must be
registered in `docs.json` (with a `redirects` entry when a page moves).

## Deployment

Push to the default branch. The Mintlify GitHub app auto-deploys changes.

## Need help?

- Run `mint broken-links` to check for broken links
- Run `mint update` to get the latest CLI version
- [Mintlify docs](https://mintlify.com/docs)
