// Reviewed behavior supplements the real ToolSpecs; action coverage is checked in both directions.
export const ID = '11111111-1111-4111-8111-111111111111';
export const OTHER_ID = '22222222-2222-4222-8222-222222222222';
const row = { id: OTHER_ID, parentId: null, label: 'Example', overrides: { headline: 'Your message' } };
const note = (group, summary, required, returns, args, extra = {}) => ({ group, summary, required, returns, args, ...extra });

export const queryNotes = {
  sources: note('Sources', 'List the brand’s uploaded template sources and parse/build state.', [], 'items: assetId, family, parseState, forgeState; more', {}),
  templates: note('Template revisions', 'List granted or built render templates.', [], 'items: key, bindingId, sourceAssetId; nextCursor', {}),
  template: note('Template revisions', 'Read exposed variables, required values, budgets, outputs and contractHash.', ['templateKey'], 'Template contract; layout is omitted', { templateKey: 'discovered-template-key' }, { conditions: 'Use bindingId from discovery when the key matches multiple workspaces.' }),
  template_tree: note('Template revisions', 'Read branches, revision history, publications and the default variant.', ['assetId'], 'templateId, defaultVariantId, variants[].revisions', { assetId: ID }),
  template_layers: note('Template revisions', 'Read editable compositions and layers of a revision.', ['revisionId'], 'Layer inventory and supported edits', { revisionId: ID }),
  template_revision: note('Template revisions', 'Read a revision and its source identity.', ['revisionId'], 'Revision: id, variantId, sourceAssetId, sourceVersionId, edits', { revisionId: ID }),
  template_diff: note('Template revisions', 'Compare edits of two revisions of one template.', ['revisionId', 'toRevisionId'], 'from, to, edits', { revisionId: ID, toRevisionId: OTHER_ID }, { errors: ['VALIDATION_ERROR: revisions must belong to one template'] }),
  template_run: note('Template revisions', 'Read the publishing run for this exact revision source.', ['assetId'], 'run (may be null), state and needs when present', { assetId: ID }),
  sets: note('Render sets', 'List saved sets, optionally filtered by templateKey.', [], 'Saved render sets', {}),
  set: note('Render sets', 'Read saved rows, inherited effective values and delivery settings.', ['setId'], 'id, revision, rows, resolved, settings, template revision pin', { setId: ID }),
  set_revisions: note('Render sets', 'Read kept states of a set.', ['setId'], 'Kept set revisions for set_fork or set_diff', { setId: ID }),
  set_diff: note('Render sets', 'Compare two rows or two kept states as rendered.', ['setId'], 'Differences in effective values and render settings', { setId: ID, fromRevision: 0 }, { conditions: 'Supply rowIds=[a,b], or fromRevision with optional toRevision (default: current).' }),
  destinations: note('Rendering', 'Read delivery and approval destinations.', [], 'Slack/approval destinations, Meta account IDs, next', {}),
  jobs: note('Rendering', 'List render jobs, optionally filtered by templateKey, setId, batchId or status.', [], 'items containing job IDs and status', {}),
  job: note('Rendering', 'Refresh a single render job and its output files.', ['jobId'], 'Render job, status and available outputs', { jobId: ID }, { effect: 'Refreshes stored status; starts no new render.' }),
  batch: note('Rendering', 'Read a batch, waiting briefly for its jobs to settle.', ['batchId'], 'batchId, done, counts, jobs[].outputs', { batchId: ID, waitSeconds: 50 }, { execution: 'Bounded wait: waitSeconds 0–55; use 50 in a background task until done=true.', effect: 'Refreshes stored status; starts no new render.' }),
  scenes: note('Scenes', 'List accessible 3D scenes and their fillable keys.', [], 'items: assetId, versionId, outputs, field keys', {}),
};

export const manageNotes = {
  source_begin: note('Sources', 'Create a signed-in mixed-file upload handoff.', [], 'upload_intent_id, open_url, expires_at, max_files', {}, { effect: 'Creates an upload intent; completing an eligible source upload can start automatic preparation.', continuationMaySpend: true, confirmation: 'Explain automatic preparation and smoke-render spend and obtain permission BEFORE completing an eligible source upload; waiting for template_forge does not prevent it.', execution: 'Returns inline; upload, parsing and eligible preparation continue separately.', retry: 'Do not retry blindly: another call creates another handoff.' }),
  source_status: note('Sources', 'Read upload readiness and classified resource IDs.', ['upload_intent_id'], 'documentIds, mediaAssetIds, templateAssetIds, source_refs, sources', { upload_intent_id: ID }, { effect: 'Reads the handoff; saves nothing.', retry: 'Safe to read again while processing.' }),
  template_preview: note('Template revisions', 'Preview proposed edits without saving a revision.', ['assetId', 'parentRevisionId', 'edits'], 'Edited layer values, svgBytes, next; no SVG body', { assetId: ID, parentRevisionId: OTHER_ID, edits: {} }, { effect: 'Validates and previews; saves nothing.', conditions: 'Read template_layers first. Edits are also checked against the revision edit contract.' }),
  template_save: note('Template revisions', 'Save edits as a new immutable revision.', ['assetId', 'parentRevisionId', 'edits'], 'revision (id, variantId, sourceAssetId), replayed', { assetId: ID, parentRevisionId: OTHER_ID, edits: {}, name: 'Example variant' }, { effect: 'Writes a source/version and revision; preserves the Original. Eligible saved sources can automatically prepare and publish.', spend: 'Yes: parsing the saved package can start automatic preparation and smoke-render spend.', confirmation: 'Obtain explicit permission for saving and its automatic preparation/spend BEFORE template_save; there is no separate render-preview token for this path.', conditions: 'Exactly one of name (new branch) or variantId (extend its current head). Requires a signed-in user session.', retry: 'Same save derives a replay key; optional UUID idempotencyKey. Re-read after a head conflict.', errors: ['PERMISSION_DENIED: signed-in session required', 'CONFLICT: branch head changed'] }),
  template_forge: note('Template revisions', 'Start or advance publication of an eligible revision source.', ['assetId', 'step'], 'source or run, next; inspect template_run', { assetId: ID, step: 'start', templateName: 'example-template' }, { role: 'Admin or Owner', effect: 'Changes publishing state; can run smoke renders and publish automatically.', spend: 'Yes: smoke renders can spend provider budget, including after start.', confirmation: 'Obtain explicit permission for this publishing run and its smoke-render spend before starting; this action has no render_preview token.', execution: 'Returns inline; inspect template_run while the run continues.', conditions: 'step=start needs templateName; step=decisions needs decisions. Native HTML/components/Blender do not use this action.', retry: 'Read template_run first. Step in only where parked; on CONFLICT re-read instead of replaying steps.' }),
  template_set_default: note('Template revisions', 'Choose the variant everyone opens by default.', ['assetId', 'variantId'], 'templateId, defaultVariantId', { assetId: ID, variantId: OTHER_ID }, { role: 'Admin or Owner', effect: 'Changes the default template variant.', retry: 'Re-read template_tree before retrying; confirm the intended default.' }),
  set_create: note('Render sets', 'Save rows for one template.', ['templateKey', 'name', 'rows'], 'Saved set: id, revision, rows and template pin', { templateKey: 'discovered-template-key', name: 'Example set', rows: [row] }, { effect: 'Creates a saved set; queues no renders.', conditions: 'Use bindingId when ambiguous; templateRevisionId, when supplied, must identify a published revision.', retry: 'No general replay guarantee; discover existing sets after an uncertain response.' }),
  set_update: note('Render sets', 'Update a saved set with a revision check.', ['setId', 'expectedRevision'], 'Saved set with its new revision', { setId: ID, expectedRevision: 0, name: 'Updated set' }, { effect: 'Writes supplied fields; rows replaces the ENTIRE row list.', conditions: 'settings merges named keys; null clears nullable settings. Prefer rows_patch for surgical row changes.', retry: 'On render_set_revision_conflict, re-read set and reconcile; never replace expectedRevision blindly.' }),
  rows_patch: note('Render sets', 'Upsert or remove selected rows with a revision check.', ['setId', 'expectedRevision'], 'Updated set and resolved rows', { setId: ID, expectedRevision: 0, rows: [row] }, { effect: 'Changes only selected rows; omitting a row ID appends a new row.', conditions: 'Supply nonempty rows or removeRowIds. Ask for explicit consent before removing rows.', retry: 'Use stable row IDs; re-read on a revision conflict. ID-less appends can duplicate on retry.' }),
  set_retarget: note('Render sets', 'Pin an existing set to a published template revision.', ['setId', 'expectedRevision', 'templateRevisionId'], 'Updated set and template revision pin', { setId: ID, expectedRevision: 0, templateRevisionId: OTHER_ID }, { effect: 'Changes the template pin after validating existing rows.', retry: 'Re-read on revision conflict; do not substitute an unpublished or unrelated revision.', errors: ['VALIDATION_ERROR: template_revision_unpublished', 'CONFLICT: render_set_revision_conflict'] }),
  set_fork: note('Render sets', 'Copy the current set or one of its kept states.', ['setId'], 'New set: id, revision and rows', { setId: ID }, { effect: 'Creates a separate set; optional revision selects a kept state.', retry: 'No general replay guarantee; inspect sets after an uncertain response.' }),
  set_delete: note('Render sets', 'Delete a saved render set.', ['setId'], 'deleted: set ID', { setId: ID }, { effect: 'Deletes the set.', confirmation: 'Ask for an explicit yes before calling. This action directly deletes; it does not issue its own confirmationToken.', retry: 'Do not retry blindly; re-read the set after an uncertain response.' }),
  suggest_rows: note('Render sets', 'Draft values from a brief, documents or media.', [], 'Unsaved suggested rows with stable draft IDs and field evidence', { templateKey: 'discovered-template-key', prompt: 'Draft one offer', count: 1 }, { effect: 'Uses AI; saves nothing.', spend: 'AI drafting may consume model budget.', confirmation: 'Use only when the person’s request authorizes AI drafting and its potential model spend; that request is sufficient consent. No server confirmation token is issued.', conditions: 'Provide setId or templateKey, and prompt or documentIds or mediaAssetIds. parentRowId requires setId.', retry: 'Another call drafts again; retain selected draft IDs for apply_suggestions.' }),
  apply_suggestions: note('Render sets', 'Append selected draft rows once.', ['setId', 'expectedRevision', 'rows'], 'setId, revision, appliedRowIds, replayed', { setId: ID, expectedRevision: 0, rows: [row] }, { effect: 'Appends the selected drafts, preserving other rows.', conditions: 'Every selected row must retain its draft id.', retry: 'Selected draft IDs provide replay protection; on a genuine revision conflict, re-read and reconcile.' }),
  render_preview: note('Rendering', 'Validate selected rows and show where each result will go.', ['setId'], 'Readiness, destinations, confirmationToken, next', { setId: ID, slackDestinationId: null, final: false }, { effect: 'Preflight only; queues no renders.', conditions: 'Omitted delivery/final settings inherit from the saved set; inspect them. null slackDestinationId disables posting. final=true requires Admin/Owner.', retry: 'Refresh after changed inputs or an expired token. Override a refusal only after the person agrees to its named flag.', errors: ['VALIDATION_ERROR: render_fonts_missing', 'CONFLICT: render_set_revision_conflict'] }),
  render_confirm: note('Rendering', 'Redeem the reviewed preflight token and queue the batch.', ['confirmationToken'], 'batchId and render job records', { confirmationToken: 'token-returned-by-render-preview' }, { effect: 'Queues rendering and the reviewed delivery/approval work.', spend: 'Yes: rendering can spend provider budget.', confirmation: 'Show readiness, rows and destinations; wait for the person’s yes, then pass the exact returned confirmationToken.', execution: 'Returns a batch immediately; read forge_query batch/job.', retry: 'Single-use token. After an uncertain response inspect existing jobs; do not obtain another token and blindly render twice.' }),
  scene_fill: note('Scenes', 'Fill an accessible scene from the brand and brief.', ['assetId', 'versionId'], 'values, outputs, confirmationToken; nothing rendered', { assetId: ID, versionId: OTHER_ID, brief: { headline: 'Your message' } }, { effect: 'Reads brand inputs and signs the proposed fill; renders nothing.', conditions: 'Use assetId/versionId/output IDs returned by scenes.', retry: 'On scene_version_stale re-read scenes; a new fill creates a fresh confirmation.', errors: ['CONFLICT: scene_version_stale', 'VALIDATION_ERROR: scene_output_unknown'] }),
  scene_render: note('Scenes', 'Redeem a reviewed scene fill and queue its outputs.', ['confirmationToken'], 'assetId, values, jobs[{outputId, jobId}], next', { confirmationToken: 'token-returned-by-scene-fill' }, { effect: 'Queues one scene render per output into the Library.', spend: 'Yes: scene rendering can spend provider budget; this response does not supply a price estimate.', conditions: 'The service reloads the current scene at submission; immutable scene-version execution is not guaranteed. Recheck scenes before confirming; if it changed, fill/review again.', confirmation: 'Show filled values and outputs, explain potential spend (estimate may be unavailable), wait for a yes, then pass the exact scene_fill token.', execution: 'Scene jobs use the template’s scene history in Forge and the Library; they are not Forge render-set batches.', retry: 'Token is single-use; after an uncertain response inspect history before another fill/render.', errors: ['VALIDATION_ERROR: expired_confirmation', 'CONFLICT: confirmation_spent'] }),
};

export const groups = ['Sources', 'Template revisions', 'Render sets', 'Rendering', 'Scenes'];
export function operationNote(tool, action) {
  const read = tool === 'forge_query';
  const reviewed = (read ? queryNotes : manageNotes)[action];
  if (!reviewed) throw new Error(`Missing reviewed documentation for ${tool}.${action}`);
  return {
    role: read ? 'Viewer or higher' : 'Operator or higher',
    effect: read ? 'Reads state; starts no render.' : 'See action behavior.',
    spend: 'No generation started by this call.',
    confirmation: 'None for this action.',
    execution: 'Returns inline.',
    retry: read ? 'Safe to read again.' : 'Re-read state after an uncertain response; no general replay guarantee.',
    errors: ['needs_brand / needs_role: resolve access first', 'NOT_FOUND / VALIDATION_ERROR: retain the returned reason'],
    ...reviewed,
    args: { action, ...reviewed.args },
  };
}

const fixture = {
  sourceAsset: ID, parentRevision: OTHER_ID,
  savedSource: '33333333-3333-4333-8333-333333333333',
  savedRevision: '44444444-4444-4444-8444-444444444444',
  set: '55555555-5555-4555-8555-555555555555',
  binding: '66666666-6666-4666-8666-666666666666',
  batch: '77777777-7777-4777-8777-777777777777',
  uploadIntent: '88888888-8888-4888-8888-888888888888',
};
const call = (tool, action, overrides = {}) => ({ name: tool, arguments: { ...operationNote(tool, action).args, ...overrides } });
export const recipes = [
  {
    title: 'An existing template',
    identities: 'The discovered binding is 666…; set_create returns set id 555…; render_confirm returns batchId 777…. Replace each with its actual returned value. The illustrative headline key must also be replaced by an exposed variable key.',
    calls: [call('forge_query', 'template', { bindingId: fixture.binding }),
      call('forge_manage', 'set_create', { bindingId: fixture.binding }),
      call('forge_query', 'set', { setId: fixture.set }),
      call('forge_manage', 'render_preview', { setId: fixture.set }),
      call('forge_manage', 'render_confirm'), call('forge_query', 'batch', { batchId: fixture.batch })],
  },
  {
    title: 'A supported source revision',
    identities: 'Upload intent: 888…. Uploaded source asset: 111…. Observed parent revision: 222…. template_save returns revision.sourceAssetId=333… and revision.id=444…. Use 333… for template_run/template_forge, and the published 444… for templateRevisionId. After publication, rediscover templateKey and bindingId (666…). The template_forge start example is CONDITIONAL: skip it if a run already exists. Wait for publication before set_create.',
    calls: [call('forge_manage', 'source_begin'), call('forge_manage', 'source_status', { upload_intent_id: fixture.uploadIntent }),
      call('forge_query', 'sources'), call('forge_query', 'template_tree', { assetId: fixture.sourceAsset }),
      call('forge_query', 'template_revision', { revisionId: fixture.parentRevision }),
      call('forge_query', 'template_layers', { revisionId: fixture.parentRevision }),
      call('forge_manage', 'template_preview', { assetId: fixture.sourceAsset, parentRevisionId: fixture.parentRevision }),
      call('forge_manage', 'template_save', { assetId: fixture.sourceAsset, parentRevisionId: fixture.parentRevision }),
      call('forge_query', 'template_run', { assetId: fixture.savedSource }),
      call('forge_manage', 'template_forge', { assetId: fixture.savedSource }),
      call('forge_manage', 'set_create', { bindingId: fixture.binding, templateRevisionId: fixture.savedRevision })],
  },
  {
    title: 'An accessible scene',
    identities: 'scenes supplies assetId 111… and versionId 222…. scene_fill returns the reviewed token; scene_render returns separate jobs[].jobId values. Recheck the scene before confirmation; the current service does not enforce the token’s source version at render time.',
    calls: [call('forge_query', 'scenes'), call('forge_manage', 'scene_fill'), call('forge_manage', 'scene_render')],
  },
];
