# AIM World and Previz integration recipes

Internal implementation guidance. These are host-driven MCP sequences, not a new hosted
trigger service or an asserted AIM World/Previz API. Their event payloads and UI wiring are
owned by those applications. Use their existing authorization and confirmation flow.

All examples use synthetic UUIDs and tokens. Replace them with discovered values; never send
them to production. The full per-action examples in `examples.json` are checked by the real
input validators during refresh. Business-level template compatibility and resource existence
are not established by input-schema acceptance.

## AIM World: an approved brief becomes template variations

1. Receive an authorized brief/offer event in the host application. Bind one brand explicitly
   with `brands_list` → `brands_select`; confirm `_brandContext` on subsequent results.
2. Load `help_describe` for the selected Forge actions. If the client enum is stale, stop that
   action and refresh discovery/use a compatible client. A help response does not change the
   client's advertised input schema.
3. `forge_query templates` → `template`. Retain `key`, `bindingId`, exposed variable keys,
   required fields and outputs. Resolve media through pinned Library asset/version IDs.
4. Map the brief only into those exposed keys. Create a set, or re-read an existing set and
   patch it with `expectedRevision` and stable row IDs. Preserve the event-to-set relationship
   in the host so a redelivered event does not blindly create another set.
5. Read `set.resolved` and `set.settings`. Use `render_preview` for the selected rows. Explicitly
   suppress inherited delivery when it is not intended; `slackDestinationId=null` suppresses
   Slack. Check Meta targets and `final`, too.
6. Present rows, destinations, warnings and spend; wait for a person to approve. Pass the
   exact returned `confirmationToken` to `render_confirm`.
7. Persist `batchId` and job IDs before reporting queued. Read `forge_query batch` in a
   background task with `waitSeconds=50` until settled. Persist output resource identities and
   refreshable links; report each failed job separately. Meta delivery retains its own approval.

```json
[
  {"name":"forge_query","arguments":{"action":"template","templateKey":"discovered-template-key","bindingId":"11111111-1111-4111-8111-111111111111"}},
  {"name":"forge_manage","arguments":{"action":"set_create","templateKey":"discovered-template-key","bindingId":"11111111-1111-4111-8111-111111111111","name":"Approved brief","rows":[{"id":"22222222-2222-4222-8222-222222222222","parentId":null,"label":"Offer","overrides":{}}]}},
  {"name":"forge_query","arguments":{"action":"set","setId":"11111111-1111-4111-8111-111111111111"}},
  {"name":"forge_manage","arguments":{"action":"render_preview","setId":"11111111-1111-4111-8111-111111111111","slackDestinationId":null,"final":false}},
  {"name":"forge_manage","arguments":{"action":"render_confirm","confirmationToken":"token-returned-by-render-preview"}},
  {"name":"forge_query","arguments":{"action":"batch","batchId":"22222222-2222-4222-8222-222222222222","waitSeconds":50}}
]
```

The empty `overrides` is a schema fixture. A real run must populate all required keys from its
actual template contract. This array describes sequential `tools/call` parameters, not a
supported MCP batch endpoint, and confirmation remains a pause between calls.

## Previz: source review becomes an immutable template variant

1. Explain and obtain permission for automatic preparation and smoke-render spend BEFORE
   completing an eligible source upload or calling `template_save`. These paths can spend
   without a later explicit `template_forge` call. `source_begin` returns the signed-in
   `open_url` and `upload_intent_id`.
2. After upload, `source_status` distinguishes document/media/template IDs. Inspect `sources`
   for the exact source family and parse state. Stop on failed or unsupported parsing.
3. `template_tree` identifies branches and revisions; `template_revision` pins the exact source;
   `template_layers` identifies editable comp/layer IDs. There is no generic edit-every-format API.
4. `template_preview` checks supported edits without saving. Present its values honestly: it
   does not return the SVG body. Use `template_save` to create a named branch or extend a branch
   with `parentRevisionId` equal to the observed head. Keep its returned revision and source IDs.
5. For an eligible AE-derived source, read `template_run` using the saved revision's
   `sourceAssetId`. An existing automatic run may already be progressing. Starting or advancing
   publication needs Admin/Owner and explicit authorization for smoke-render spend. Use
   `template_forge` only where needed; do not force every rung after an automatic start.
6. Read the publication state until the desired revision is published. Rediscover its
   `templateKey` and `bindingId` through `sources`/`templates`. Pass its revision UUID as
   `templateRevisionId` to `set_create` or `set_retarget`. Retarget also requires the set's current
   numeric `expectedRevision`. Preview the resulting rows again before rendering.

```json
[
  {"name":"forge_manage","arguments":{"action":"source_begin"}},
  {"name":"forge_manage","arguments":{"action":"source_status","upload_intent_id":"88888888-8888-4888-8888-888888888888"}},
  {"name":"forge_query","arguments":{"action":"sources"}},
  {"name":"forge_query","arguments":{"action":"template_tree","assetId":"11111111-1111-4111-8111-111111111111"}},
  {"name":"forge_query","arguments":{"action":"template_layers","revisionId":"22222222-2222-4222-8222-222222222222"}},
  {"name":"forge_manage","arguments":{"action":"template_preview","assetId":"11111111-1111-4111-8111-111111111111","parentRevisionId":"22222222-2222-4222-8222-222222222222","edits":{}}},
  {"name":"forge_manage","arguments":{"action":"template_save","assetId":"11111111-1111-4111-8111-111111111111","parentRevisionId":"22222222-2222-4222-8222-222222222222","edits":{},"name":"Reviewed variant"}},
  {"name":"forge_query","arguments":{"action":"template_run","assetId":"33333333-3333-4333-8333-333333333333"}},
  {"name":"forge_manage","arguments":{"action":"template_forge","assetId":"33333333-3333-4333-8333-333333333333","step":"start","templateName":"reviewed-variant"}},
  {"name":"forge_manage","arguments":{"action":"set_retarget","setId":"11111111-1111-4111-8111-111111111111","expectedRevision":0,"templateRevisionId":"44444444-4444-4444-8444-444444444444"}}
]
```

In this fixture the upload intent is `888…`, the uploaded source is `111…`, and the saved revision returns `sourceAssetId=333…` and `id=444…`; the observed parent is `222…`. The `template_forge start` example is conditional on no existing run, and the final retarget waits for publication. Empty `edits` is deliberately a no-op schema fixture. Real edits must use the selected
revision's editable inventory and pass the shared edit contract. Never send native HTML,
components or Blender to `template_forge`.

## Previz: an accessible scene becomes product outputs

1. `scenes` returns the scene `assetId`, exact `versionId`, field keys and output IDs.
2. `scene_fill` maps the brand's kit and supplied brief into values; it renders nothing. Re-read
   `scenes` if `scene_version_stale` is returned.
3. Show filled values and outputs, and explain potential spend. These responses do not provide
   a price estimate; state that it is unavailable unless another verified source supplies one.
   Re-read the scene immediately before confirmation; refill/review if it changed. Obtain
   approval, then call `scene_render` with the exact fill token. The service reloads the current
   scene without checking the token's versionId, so a race remains even with a fresh read.
   Expiry or replay is a refusal, not another render instruction.
4. Persist every returned `{outputId, jobId}`. Use scene history in Forge and the Library for
   completion and files. Do not route these IDs to `forge_query batch` or assume `job` supports
   scene jobs. Automatic host-side scene completion needs an independently verified status API.

```json
[
  {"name":"forge_query","arguments":{"action":"scenes"}},
  {"name":"forge_manage","arguments":{"action":"scene_fill","assetId":"11111111-1111-4111-8111-111111111111","versionId":"22222222-2222-4222-8222-222222222222","brief":{"headline":"Your message"}}},
  {"name":"forge_manage","arguments":{"action":"scene_render","confirmationToken":"token-returned-by-scene-fill"}}
]
```

## Host recovery rules

Keep event IDs and returned resource IDs in the host's existing state store. Reads may be
repeated; creates, forks and ID-less appends must be reconciled after an uncertain response.
Preserve the service's refusal reason. Never bypass a revision conflict, missing role or
unrelated guard to force a run. Token expiry or reuse needs state inspection and, where safe,
a fresh preview plus a new yes. No webhook registration, hosted automation deployment,
production rendering or external publishing was performed for these recipes.
