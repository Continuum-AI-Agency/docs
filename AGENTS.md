# Continuum documentation project instructions

## About this project

- Documentation site for [Continuum](https://trycontinuum.ai), an AI creative operations platform
- Built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter
- Configuration lives in `docs.json`
- Run `mint dev` to preview locally
- Run `mint broken-links` to check links

## Ground rule: document the shipped product

Only document what the product actually does today. Before writing about a feature, confirm
it exists in the product (the codebase is the source of truth). Do not document roadmap or
aspirational features as if they ship. If you are unsure whether something exists, leave it
out rather than assert it.

## Terminology

Use the product's real, user-facing names:

- **AI Studio** — the creative generation area (the infinite node canvas). The sidebar labels
  it "Canvas"; refer to the surface itself as "the canvas," and the product area as "AI Studio."
- **Organic** — the organic social workspace. Sub-areas: **Organic agent**, **Content calendar**
  (the Planner), **Organic analytics**.
- **Scale** — the paid media area. Sub-areas: **Jaina** (the paid agent), **Paid analytics**,
  **Paid optimization** (the Optimizer).
- **Brand Spy** — competitor intelligence (tracking competitors' organic posts and paid ads).
- **Brand book** — the living, AI-generated brand identity that grounds generations.
- **Brand readiness score** — a 0–100 score of how complete the brand profile is (7 dimensions).
  It is informational and **blocks nothing** — never describe it as compliance or a publishing gate.
- **Brand kit** — logo (a file), brand colors (hex), and typography (font-family names).
- **Brand / brand profile** — the primary scope for all work. Reserve "account" for connected
  ad/social accounts and the user's login.
- **creative** — produced content (images, videos, ads). **asset** — a raw file (upload).
- **node** / **block**, **workflow** (a saved node graph), **creative skill** (a reusable
  creative-direction directive), **brand-book grounding** (steering a generation toward the brand).
- **draft** — an organic post in the Planner. **DCO** — dynamic creative optimization (surfaced
  as "DCO actions").
- Integrations model: **connect once, assign to a brand.**

Avoid retired/incorrect terms: "Canvas Studio," "brand guardrails," a "New Campaign" wizard,
"Social" as a product area (it's **Organic**), and calling LinkedIn/TikTok "coming soon."

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use **sentence case** for headings (`## How the canvas works`, not `## How The Canvas Works`)
- Do not number top-level headings
- Bold for UI elements and navigation paths: Click **Settings**, go to **Settings → Integrations**
- Code formatting for file names, keys, states, model ids, and paths: `veo-3.1`, `Shift+F`, `idle`
- Use Mintlify components (Steps, Cards, Tips, Info, tables) generously for scannability
- End substantive pages with a "What's next" `<CardGroup>` linking related pages

## Frontmatter template

Every page starts with:

```yaml
---
title: "Sentence case title"
description: "One-sentence summary — used for SEO and social cards."
---
```

Use double quotes. `title` and `description` are required on every page.

## Component reference

In use across the site: `<Steps>`/`<Step>`, `<Card>`/`<CardGroup>`, `<Columns>`, `<Tip>`,
`<Info>`, `<Note>`, `<Warning>`, markdown tables, and `<Update>` (changelog entries).
`<Accordion>`/`<AccordionGroup>`, `<Tabs>`/`<Tab>`, and `<CodeGroup>` are available when they aid
scannability. **No images yet** — visuals arrive in a later branding pass; use tables, Steps, and
Cards instead. Do not embed external image URLs.

## Adding or moving pages

- Every new page **must** be registered in `docs.json` navigation, or it is orphaned (unreachable).
- When you rename or move a page, add a `redirects` entry in `docs.json` (`source` → `destination`)
  so inbound links don't 404.
- Internal links are root-relative without the extension: `[Integrations](/integrations)`.

## Content boundaries

- Document user-facing product features only
- Do not document internal admin tools or infrastructure. Internal-only notes belong in a
  `*.draft.mdx` file or `drafts/` (both excluded by `.mintignore`), never in the public nav
- Do not reference specific pricing amounts — link to [pricing](https://trycontinuum.ai/#pricing)
- Do not include customer names without explicit approval
