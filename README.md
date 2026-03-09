# Continuum Docs

Documentation site for [Continuum](https://trycontinuum.ai) — the AI-powered creative operations platform.

Built with [Mintlify](https://mintlify.com).

## Local development

```bash
npm i -g mint
mint dev
```

Preview at `http://localhost:3000`.

## Structure

```
├── index.mdx              # Welcome page
├── quickstart.mdx          # Onboarding guide
├── platform/               # Platform guides
│   ├── overview.mdx
│   ├── campaigns.mdx
│   ├── dco.mdx
│   ├── brand-guardrails.mdx
│   └── analytics.mdx
├── studio/                 # Creative Studio guides
│   ├── templates.mdx
│   ├── canvas.mdx
│   └── assets.mdx
├── docs.json               # Mintlify configuration
└── logo/                   # Brand logos
```

## Deployment

Push to the default branch. The Mintlify GitHub app auto-deploys changes.

## Need help?

- Run `mint broken-links` to check for broken links
- Run `mint update` to get the latest CLI version
- [Mintlify docs](https://mintlify.com/docs)
