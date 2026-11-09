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

Use the product's real, user-facing names. The app's sidebar groups everything into three product
lines; the docs mirror them.

- **Creative+** — the creative area. Contains:
  - **AI Canvas** — the infinite node canvas (labeled **Canvas** in the app). Refer to the surface as
    "the canvas." Do not call it "AI Studio" or "Canvas Studio."
  - **Pipelines**, **Elements**, **Video Studio**, **Library**, **Forge** (fills design templates,
    including After Effects projects, to make many versions), and **Brand Spy** (competitor intelligence).
- **Organic+** — organic social. Sub-areas: **Organic agent**, **Calendar** (content calendar / Planner),
  **Organic analytics**.
- **Performance+** — paid media. Sub-areas: **Jaina** (the ads analyst), **Paid analytics**,
  **Paid optimization** (the Optimizer). "The Optimizer proposes. Jaina explains. You approve."
- **AI assistant / connector / MCP** — Continuum used from Claude, ChatGPT, or another MCP client.
  Customer-facing copy says "connector"; use "MCP" in headings and for technical readers.
  Server: `https://api.trycontinuum.ai/mcp` (ChatGPT: `https://api.trycontinuum.ai/mcp/chatgpt`).
  Sign-in is OAuth with the Continuum login; there are no API keys for MCP.
- **Brand book** — the living, AI-generated brand identity that grounds generations.
- **Brand readiness score** — a 0–100 score of how complete the brand profile is (7 dimensions).
  It is informational and **blocks nothing** — never describe it as compliance or a publishing gate.
- **Brand kit** — logo (a file), brand colors (hex), and typography (font-family names).
- **Brand / brand profile** — the primary scope for all work. Reserve "account" for connected
  ad/social accounts and the user's login.
- **creative** — produced content (images, videos, ads). **asset** — a raw file (upload).
- **node** / **block**, **workflow** (a saved node graph), **creative skill** (a reusable
  creative-direction directive), **brand-book grounding** (steering a generation toward the brand).
- **draft** — an organic post in the Planner.
- Roles: **Owner**, **Admin**, **Operator**, **Viewer**.
- Integrations model: **connect once, assign to a brand.**

Keep out of the public docs (internal-only or pilot per the product's capability register): DCO,
the Campaign Flow Canvas (their old pages are `performance/*.draft.mdx`), the API Render node, video
background removal, and Automations. Never mention pilot features or a pilot program. (The Optimizer's
**Autopilot** mode is a shipped setting and is fine to document.) When in doubt, check `docs/capability-matrix-external.md` on the
monorepo's main branch and the customer MCP guide (`docs/mcp-user-guide.md`, same branch); Pipelines, Elements, Video Studio, and
Forge are cleared through that guide. Ask before documenting anything that appears in neither.

Avoid retired/incorrect terms: "AI Studio" and "Scale" as area names, "Canvas Studio," "brand
guardrails," a "New Campaign" wizard, "Social" as a product area (it's **Organic+**), and calling
LinkedIn/TikTok integrations "coming soon."

## The assistant's confirmation model (keep docs consistent)

- **Waits for a yes (preview first):** publishing a post; creating or changing Meta campaigns, ad sets,
  ads, budgets, or audiences; swapping a live ad's creative; final Forge renders; deletions. The one
  exception is Forge `set_delete`, which deletes with no preview: docs tell the assistant to ask first.
- **Happens right away:** rescheduling, caption rewrites, review status, comments; Canvas runs,
  pipeline runs, and video edits/exports (protected by hourly limits); approving a Paid optimization
  recommendation (the approval is the yes).
- New campaigns are always created **paused**; activating one needs an Admin or Owner's approval (`APPROVAL_REQUIRED` → `mcp_approval_grant`). The Optimizer never pauses an ad without a person approving that specific pause.
- **Settings → Activity** shows each person their own assistant actions; **Settings → Connections** lists
  and revokes connected assistants.

## Style preferences

- Use active voice and second person ("you")
- Keep sentences concise — one idea per sentence
- Use **sentence case** for headings (`## How the canvas works`, not `## How The Canvas Works`)
- Do not number top-level headings
- Bold for UI elements and navigation paths: Click **Settings**, go to **Settings → Integrations**
- Code formatting for file names, keys, states, model ids, and paths: `veo-3.1`, `Shift+F`, `idle`
- Use Mintlify components (Steps, Cards, Tips, Info, tables) generously for scannability
- End substantive pages with a "What's next" `<CardGroup>` linking related pages
- Give long titles a short `sidebarTitle` in frontmatter so the sidebar stays scannable

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
scannability. For per-client setup, prefer one `###` section per client over tabs.

## Generated pages

- `mcp/tools.mdx`, `mcp/tools/*.mdx`, and `mcp/tools.json` come from `scripts/mcp-docs.mjs`. Edit
  `scripts/mcp-notes.mjs` (areas and one-line summaries), never the output. When the server changes, run
  `node scripts/mcp-docs.mjs --refresh <clean continuum-backend checkout> <clean monorepo checkout>`; CI runs `--check`.
- Forge pages come from `scripts/forge-docs.mjs`; edit `scripts/forge-notes.mjs` and `scripts/forge-formats.mjs`.

## Agent context

- The tool reference (`mcp/tools*`, `/mcp/tools.json`, `/mcp/schemas/`) documents every tool and action the
  server registers, including actions outside the capability matrix (for example `paid_manage` `google_ads`):
  the owner chose full coverage on 2026-11-09 so agents never meet an undocumented tool. Product pages still
  describe only cleared capabilities.
- `skill.md` (root) replaces Mintlify's generated skill file. Keep it to cleared capabilities and the agent
  brief's rules. `llms.txt` comes from `scripts/mcp-docs.mjs`; `llms-full.txt` from `scripts/llms-full.mjs`
  (run it with `mint dev` up after any page edit; the tests fail when it goes stale).
- Code fences sit inside `<Visibility for="humans">` with an inline-code twin in `<Visibility for="agents">`,
  and card groups get a plain link list twin, because Mintlify's markdown export adds `theme=` metadata to
  fences and `[card]` markup to cards. The tests enforce both.

`docs.json` lists `copy` first in `contextual.options`, so **Copy page** is the default page action.
`agent-copy.js` puts three lines at the top of that paste: the page URL, that page's `.md` URL, and
`/llms.txt`. On the hosted site the rest is Mintlify's markdown export. `mint dev` does not serve
`.md`, so the local paste uses the article on the page instead.

## Images and diagrams

- **Diagrams** come from `snippets/diagrams.jsx` (styles: the `.cn-*` rules in `style.css`). Text stays real text, and
  they follow light/dark mode. Import with `import { Flow, Lanes, CreativeLoop } from "/snippets/diagrams.jsx";`.
  - `<Flow steps={[...]} you="..." label="..." />` — a numbered row of steps; `you` highlights the step that needs a person.
  - `<Lanes lanes={[{ label, steps, you, note, tone }]} />` — stacked flows that compare paths (`tone`: `"gate"` or `"muted"`).
  - Use a diagram only when order or branching is the point. Keep the table or Steps that carry the detail.
- **Section heroes**: only the four section overviews (`mcp/overview`, `canvas/overview`, `organic/overview`,
  `performance/overview`) carry a world plate from trycontinuum.ai:
  `<img className="cn-hero" src="/images/world/<name>-banner.webp" alt="" width="1376" height="430" loading="eager" decoding="async" fetchpriority="high" sizes="(min-width: 52rem) 52rem, 100vw" noZoom />`.
  Heroes stay eager so the first paint isn't waiting on them. Wrap each hero in `<Visibility for="humans">` so the markdown export doesn't carry a CDN image line.
- **Product-line plates** use `<WorldCard img="/images/world/<name>-card.webp" href="/path">` from `snippets/world-card.jsx`,
  with the Mintlify `<Card>` (no `href` of its own) as its child. The plate is `loading="lazy"` and `fetchpriority="low"`. Don't add plates elsewhere.
- `dither.js` reveals a plate that hasn't painted yet with the same glyph dither as the app (`ascii-reveal` preset `dither`).
  An image already on screen stays put. Reduced motion skips the effect.
- Images live in `images/` as WebP under 200 KB. Decorative images get `alt=""`; anything that carries
  information gets real alt text. Product screenshots must use a demo brand, never a customer's.
- Never embed external image URLs, and never use Mintlify starter imagery.

## Look and feel

- The site uses Mintlify's `luma` theme, dark by default, restyled to match trycontinuum.ai.
- Brand tokens (colors, callouts, labels, the navbar button) live in `style.css`. Change colors there and
  in `docs.json` `colors`/`background` together.
- Fonts are self-hosted in `fonts/`: Clash Display (headings), Satoshi (body), Geist Mono (code and labels).
- `logo/*.svg` holds the mark plus the CONTINUUM wordmark outlined to paths, so no font file is needed.

## Adding or moving pages

- Every new page **must** be registered in `docs.json` navigation, or it is orphaned (unreachable).
- Per-client connection steps live only in `quickstart.mdx` (`/mcp/connect` redirects there), and
  troubleshooting lives only in `troubleshooting.mdx`, with an assistant section and an app section.
- Keep every page at most two sidebar clicks deep. Top-level groups (Get started, AI assistant,
  Creative+, Organic+, Performance+, Brand and account, Resources) always stay open; nest at most one
  more level (for example AI Canvas or Forge inside Creative+), and never nest a group inside a nested
  group. Nested groups stay collapsed unless the reader is inside them. Give a group's first page
  `sidebarTitle: "Overview"`, and keep sidebar titles unique within a group.
- When you rename or move a page, add a `redirects` entry in `docs.json` (`source` → `destination`)
  so inbound links don't 404.
- Internal links are root-relative without the extension: `[Integrations](/integrations)`.

## Content boundaries

- Document user-facing product features only
- Do not document internal admin tools or infrastructure. Internal-only notes belong in a
  `*.draft.mdx` file or `drafts/` (both excluded by `.mintignore`), never in the public nav
- Do not reference specific pricing amounts — link to [pricing](https://trycontinuum.ai/#pricing)
- Do not include customer names without explicit approval
