# Forge internal agent map

This directory is excluded by `.mintignore`. Do not link it from public pages or copy its
inventory into a public export. Public documentation starts at `/forge/agents`.
This repository is public: exclusion controls the documentation site, not access to Git
files. Store no credentials, customer material or confidential operational evidence here.

## What the evidence means

`sources.lock.json` pins the backend and monorepo commits and hashes `source.json`.
`source.json` records the registry state, action enums, schema hashes, validator results,
runtime versions and hashes of the inspected source files. `schemas/` contains the full
serialized input/output schemas. `inventory.json` combines those facts with reviewed stage
and action notes. No server handler was executed to produce them.

The observed Continuum Test connector advertised **9 query / 12 manage actions** on
2026-10-29, while its live `help_describe` returned **17 / 18**. The lock file retains both
actual action lists. This is a client-schema discrepancy, not permission to pass undeclared
actions through that connector. Refresh its schema or use a compatible MCP client before
attempting the additional actions. Registered, advertised, described, callable, deployed,
and customer-qualified are separate facts.

Mutation callability, arbitrary-file fidelity, hosted lifecycle and customer qualification
were **UNRUN** in this documentation work. Existing tests and descriptions are evidence of
implementation, not a new runtime acceptance result. There are no customer media or credentials
in these snapshots.

## Qualification gaps and contradictory records

- The monorepo capability register's row 29 still restricts source-to-template promotion;
  row 32 describes Premiere/Photoshop as unbuilt, while newer source and live tool help
  describe broader intake. The external capability matrix does not enumerate these families.
  The customer MCP guide clears filling existing Forge templates. Retain this disagreement
  until the capability owner updates the register with current deployment/client evidence.
- The public format table states stage boundaries rather than declaring every family fully
  supported. Presence in Library formats or `templateSourceFamilySchema` is not render proof.
- Presentation-specific actions appear in other historical checkouts, but are absent from
  the pinned Forge query/manage enums. Do not resurrect them in agent recipes.
- Figma is a source-family enum and connected-import path; Canva is a connection vocabulary.
  Neither is an arbitrary local-file Forge editing API. Their current callable integration
  contracts need separate evidence.
- Native HTML/HyperFrames, web components and Blender do not enter AE publication. Native
  and browser behavior/fidelity must be qualified separately; no AE-exact fallback is implied.
- CAD has separate `cad_query` / `cad_manage` tools. The current mesh capability guide and
  exact request/revision/artifact IDs govern it. Scene rendering, mesh validity, process and
  physical qualification are different gates. Do not infer native STEP/DWG or manufacturing
  readiness from a Library model viewer.
- `set_delete` directly calls the delete service. The agent must obtain the person's yes;
  this action does not mint its own Forge render token. Template publication similarly has
  no render-preview token and can spend during automatic smoke renders.
- Source upload and `template_save` can already trigger automatic preparation through parsing
  and source registration. Obtain spend permission before those steps, not just before an
  explicit `template_forge` call. The chain is `templateRevisionEdits` → `aepExport` →
  `service.parseTemplateSource` → `initialPreparation` → `forgeAutopilot` smoke/publish.
- `scene_fill` signs a version ID, but `scene_render` reloads the current scene without checking
  it against the token's version. Re-reading before confirmation reduces the window but does
  not guarantee immutable execution. A runtime fix is outside this documentation PR.
- Render preflight and scene-fill responses do not expose a price estimate. Explain possible
  spend and state when an estimate is unavailable; never invent a cost.
- `template_preview` returns `svgBytes` and edited values, not the SVG itself. `scene_fill`
  returns values, not a pixel preview. Render-set preflight and full rendering are separate.
- Scene jobs have a different history/results interface. A generic Forge scene-job polling,
  webhook or cancellation recipe is not established by this map.
- Output `result` may be opaque in the real schema. The catalog's return summaries are
  sourced from handlers and shared contracts; they are not a fabricated stronger output type.

## Refresh and check

Use clean, pinned backend and monorepo checkouts with their normal dependencies available.
Do not copy production `.env` files. The exporter disables automatic env-file loading, passes
only PATH to its subprocess, blocks fetch, and replaces the integration DB import with a
throwing stub. It calls the existing manifest builder, schema serializers and actual input
validators; it never calls a tool handler, starts Fastify, or creates a render job.

```bash
node scripts/forge-docs.mjs --refresh --backend /path/to/continuum-backend --monorepo /path/to/Continuum-Monorepo --date 2026-10-29
node scripts/forge-docs.mjs --check
node --test tests/forge-docs.test.mjs
```

The refresh command maps installed workspace packages to the supplied monorepo. It requires
Bun plus those repositories' dependencies; it does not install or modify them. Record the
new commits and observed runtime/client action lists in `sources.lock.json`. The exporter
preserves those explicit observations rather than pretending an offline refresh observed a
live server. Review `scripts/forge-notes.mjs` whenever actions or behavior change and
`scripts/forge-formats.mjs` whenever format support changes.

CI validates this pinned export, example coverage, generated output, navigation and exclusions.
It does not monitor upstream private repositories or automatically publish a source change.
Run the refresh when Forge contracts change. Runtime `help_describe {tool, action}` remains
the discovery reference for an agent about to execute.

Mintlify does not serve arbitrary JSON files as static assets. The public JSON operation
index is served as `/forge/agent-manifest.txt`; it is byte-identical to the canonical
`forge/agent-manifest.json` in Git. Its body is JSON, with a text content type. This avoids
introducing an API endpoint or pretending the index is an OpenAPI specification.

For the documentation site use the repository's `mint dev` and `mint broken-links` commands.
Deployment happens only after the docs PR is merged to the default branch.
