// Reviewed, human-written facts for the generated MCP tool reference (scripts/mcp-docs.mjs).
// Everything else on those pages comes from drafts/mcp/source.json, exported from the server.

// One page per area. Every advertised tool must appear exactly once; the generator fails on drift.
export const areas = [
  {
    slug: 'account', title: 'Account, brand, and jobs', sidebarTitle: 'Account and brand',
    description: 'MCP tools for choosing a brand, connecting platforms, reading the brand book, asking the agents, and following jobs: inputs, examples, and errors.',
    tools: {
      brands_list: 'Lists the brands you can access.',
      brands_select: 'Sets the brand the conversation works on and lists its published pipelines.',
      brands_create: 'Starts a new brand. You finish setting it up in the Continuum app.',
      account_map: 'Shows connected platforms and accounts, ad accounts, and your role.',
      accounts_list: 'Lists the accounts assigned to the brand.',
      integrations_list: "Lists the brand's connections.",
      integrations_connect: 'Returns a one-time link to connect a platform. Links work for 10 minutes.',
      integration_health_check: 'Checks whether a connection is healthy, expired, or disconnected.',
      brand_knowledge: 'Reads and searches your brand book and knowledge base, checks copy against your voice, and adds, updates, or archives source material.',
      agent_ask: 'Asks [Jaina](/performance/jaina) or the [Organic agent](/organic/agent) a question. Runs as a job.',
      jobs_status: 'Checks on a long-running job.',
      help_describe: 'Describes any registered tool and its actions: the full input schema, examples, and common errors.',
    },
  },
  {
    slug: 'insights', title: 'Analytics, trends, and competitors', sidebarTitle: 'Analytics and intel',
    description: 'MCP tools for organic, paid, and website results, audiences, creative strategy, trends, and competitor intelligence: inputs, examples, and errors.',
    tools: {
      analytics_query: 'Organic, paid, and website results by platform: accounts, top posts, campaigns, ad sets, and ads.',
      analytics_creative_insights: 'Ranks your Meta ad creatives by video retention: hook rate and hold rate.',
      analytics_cross_platform_spend: 'Spend, conversions, cost per acquisition, and return on ad spend across your connected ad platforms.',
      analytics_pacing_diagnostic: 'Which Meta campaigns are pacing ahead of or behind budget, with a 0–100 health score.',
      audience_query: 'Your Meta audiences, ad set targeting, and demographic and placement breakdowns.',
      creative_strategy: 'What works for you: opening-line (hook) scoring, win rates, and competitive gaps.',
      trends_manage: "Your brand's trends report.",
      intel_trend_discovery: 'The hashtags people post under on Instagram or TikTok, with post counts and growth, plus trending search keywords on TikTok.',
      intel_competitor_moves: 'A digest of what your tracked competitors run in paid ads and post organically, by angle, hook, call to action, and format.',
      intel_competitor_ads: 'Ads from competitors you track, including how long each has run.',
      intel_competitor_organic: 'Organic posts from competitors you track.',
      intel_competitor_ad_library: 'Looks up any advertiser in the Meta Ad Library.',
      intel_competitor_scan: "Runs a fresh competitor scan, the same as the app's **Scan** button.",
    },
  },
  {
    slug: 'organic', title: 'Organic+ planning and publishing', sidebarTitle: 'Organic+',
    description: 'MCP tools for the calendar, drafts, approvals, publishing, and remaking reference posts: inputs, examples, and errors.',
    tools: {
      planner_manage: 'Reads and proposes a week of posts, approves it, reschedules and copies posts, and attaches media.',
      content_create: 'Drafts, approves, and publishes posts, and deletes drafts.',
      organic_draft_list: 'Lists drafts on the calendar.',
      organic_draft_get: 'Reads one draft.',
      content_reference: "Remakes a public Instagram post or reel as your brand's own: its structure, never its words.",
      headless_content: 'Makes vertical reels, stills, and carousels from your brand guide without opening the canvas.',
    },
  },
  {
    slug: 'paid', title: 'Performance+ ads and optimization', sidebarTitle: 'Performance+',
    description: 'MCP tools for campaigns, ad sets, ads, audiences, naming, and Paid optimization: inputs, examples, confirmations, and errors.',
    tools: {
      paid_manage: 'Reads your campaign structure; creates paused campaigns, ad sets, and ads; updates or pauses them; builds audiences and lookalikes; and keeps an audit log of every write.',
      paid_naming_schema_get: "Your brand's campaign naming convention.",
      optimizer_query: 'Portfolios, pending recommendations, performance, and the optimization log.',
      optimizer_manage: 'Approves or rejects recommendations and manages portfolios.',
    },
  },
  {
    slug: 'creative', title: 'Creative+ canvas, pipelines, and delivery', sidebarTitle: 'Creative+ canvas',
    description: 'MCP tools for canvas workflows, saved pipelines, Elements, and sending finished creative to a post or an ad: inputs, examples, and errors.',
    tools: {
      studio_workflow: 'Builds, edits, runs, saves, and lists canvas workflows.',
      studio_deliver: 'Previews and sends finished creative to a planned post, an organic publish, or a live ad, and restores a swapped ad.',
      pipeline_search: "Finds your team's saved pipelines.",
      pipeline_describe: 'Shows what a pipeline needs.',
      pipeline_invoke: 'Runs a pipeline, up to 10 versions per request.',
      pipeline_run_status: 'Checks a pipeline run.',
      list_elements: 'Lists your saved Elements.',
    },
  },
  {
    slug: 'library', title: 'Library, media, and video', sidebarTitle: 'Library and video',
    description: 'MCP tools for the Library, media search and upload, web-page captures, stock photos, and Video Studio edits: inputs, examples, and errors.',
    tools: {
      library_manage: 'Browses the Library, shows where a creative has run, adds comments, sets review status, and uploads media.',
      media_search: 'Finds media by describing it.',
      media_upload_and_clip: 'Uploads a video to clip. Clipping finishes in the Continuum app.',
      media_capture_url: 'Turns a public web page into a screenshot or a scroll-through video in your Library.',
      unsplash_search: 'Searches Unsplash stock photos to use as references.',
      video_editor: 'Edits video in Video Studio: cut silences, cut to the beat, captions, text, music, formats, export, and undo.',
    },
  },
  {
    slug: 'forge', title: 'Forge templates and CAD files', sidebarTitle: 'Forge and CAD',
    description: 'MCP tools for Forge templates, render sets, and renders, and for CAD mesh files: inputs, examples, and errors.',
    tools: {
      forge_query: 'Lists Forge templates, sets, and render jobs. Full contracts: [Forge functions](/forge/functions).',
      forge_manage: 'Writes versions into a template, previews them, and produces final renders. Full contracts: [Forge functions](/forge/functions).',
      cad_query: 'Reads CAD mesh capabilities, files, revisions, and jobs.',
      cad_manage: 'Uploads STL, DXF, or 3MF files, then transforms, renders, validates, or exports them.',
    },
  },
];

// What each error code means, for codes a tool can return without its own help_describe note.
export const codeMeaning = {
  UNAUTHENTICATED: 'The sign-in is missing or expired. Reconnect the assistant.',
  SESSION_NOT_INITIALIZED: 'Send `initialize` first.',
  BRAND_NOT_SELECTED: 'No brand is active. Call `brands_select`.',
  BRAND_NOT_READY: 'The brand has not finished onboarding in the Continuum app.',
  BRAND_FORBIDDEN: "The person can't reach that brand.",
  PERMISSION_DENIED: "The person's role can't do this. Ask an Admin or Owner.",
  VALIDATION_ERROR: 'An input is missing or wrong, or it changed since the preview. `details` names the field.',
  CONFIRMATION_REQUIRED: 'This write needs a preview first. Preview, get a yes, then confirm with the returned token.',
  APPROVAL_REQUIRED: 'An Admin or Owner has to grant the pending change with `mcp_approval_grant` before you confirm.',
  INTEGRATION_REQUIRED: 'Connect the platform with `integrations_connect`.',
  INTEGRATION_DISCONNECTED: 'The connection lapsed. Reconnect it with `integrations_connect`.',
  RATE_LIMITED: 'Wait `details.retry_after_seconds`, then retry.',
  NOT_FOUND: "The item doesn't exist, or this brand can't see it.",
  CONFLICT: 'The item changed or is busy. Read it again, then retry with the current state.',
  JOB_PENDING: 'The job is still running. Check `jobs_status` later.',
  JOB_ENQUEUE_FAILED: "The job couldn't start. Retry once, then contact support.",
  UNAVAILABLE_HERE: "This input can't be used from this server, for example a private or non-https URL.",
  UPSTREAM_ERROR: 'A platform or provider returned an error. `details` carries its message.',
  META_API_ERROR: 'Meta returned an error. `details` carries its message.',
  INTERNAL: 'Something went wrong on our side. Retry once, then contact support.',
  ACCOUNT_FORBIDDEN: "That ad or social account isn't assigned to this brand, or the person can't reach it. Pick one from `accounts_list`.",
  VOICE_VIOLATION: 'The copy breaks a brand voice rule, such as a banned word. `details` names the rule; rewrite and try again.',
  MEDIA_INVALID: "The file can't be used: wrong type, size, or dimensions. `details` says which.",
  NOT_IMPLEMENTED: "This path isn't available yet. Don't retry; use the listed tool for the job.",
  CTX_MISSING_MODE_A_FIELDS: 'The call is missing session context. Reconnect the assistant and retry.',
};

// Status results that are not errors. A tool can return these when it has the requirement.
export const needs = {
  needs_brand: () => 'No brand is active. Call `brands_select`.',
  needs_role: (role) => `The person's role is below ${role}. Ask an Admin or Owner.`,
  needs_integration: (platform) => `The brand has no ${platform} connection. Call \`integrations_connect\`.`,
};

// Reviewed example calls, validated against each tool's input schema at export. IDs are
// illustrative: use the ones earlier calls return.
const PORTFOLIO = '3f6b2c1e-8a4d-4f7b-9c2e-1d5a7b9e0c43';
const RECOMMENDATION = '9a1d4e7c-2b6f-4c8a-b3e5-7f0d2a6c9b18';
const ACCOUNT = '5c8e1a3b-7d2f-4e6a-9b4c-0f1e3d5a7c92';
const ASSET = 'b7d3f9a1-4c6e-4a2b-8d5f-6e9c1b3a7d40';
const REVISION = 'e2a6c4b8-1f3d-4b7e-a9c5-3d8f0b2e6a14';
const PIPELINE = '1c4e7a9d-3b5f-4d2a-8e6c-9f0b2d4a6c81';
const FAMILY = '6d9b2f4a-8c1e-4f3b-b7d5-2a4c6e8f0b39';
const RUN = 'f4a8c2e6-0b3d-4a7f-9c1e-5b7d9f1a3c62';
const DRAFT = '8b2d6f0a-4e7c-4b1d-a3f5-7c9e1b3d5f27';

export const examples = {
  account_map: [{ title: 'Platforms and accounts for the active brand', arguments: { depth: 'accounts' } }],
  agent_ask: [
    { title: 'Ask Jaina why a metric moved', arguments: { target: 'jaina', query: 'Why did our cost per purchase rise last week, and which ad sets drove it?' } },
    { title: 'Ask the Organic agent for ideas', arguments: { target: 'organic', query: 'Give me three Reel ideas for our autumn launch, based on what performed best last month.' } },
  ],
  agent_cancel: [{ title: 'Cancel a running agent job', arguments: { jobId: 'job_8f2c41d7' } }],
  analytics_query: [
    { title: 'Top Instagram posts by engagement, last 30 days', arguments: { platform: 'instagram', scope: 'top_posts', metric: 'engagement_rate', date_window: 'last_30d', top_n: 5 } },
    { title: 'Meta ad account overview, last 7 days', arguments: { platform: 'meta', account_id: 'act_1234567890', scope: 'overview', date_window: 'last_7d' } },
  ],
  audience_query: [
    { title: 'List custom audiences', arguments: { action: 'list_audiences', ad_account_id: 'act_1234567890', kind: 'custom' } },
    { title: 'Results by age, last 30 days', arguments: { action: 'breakdown', ad_account_id: 'act_1234567890', dimension: 'age', date_window: 'last_30d' } },
  ],
  brand_knowledge: [
    { title: 'See what the knowledge base holds', arguments: { action: 'overview' } },
    { title: 'Search the brand book', arguments: { action: 'search', query: 'tone of voice for promotions' } },
    { title: 'Check copy against the brand voice', arguments: { action: 'validate', copy: 'Autumn is here. Our new single-origin roast is out now, in a limited batch.', platform: 'instagram' } },
  ],
  brand_profile_get: [{ title: 'Read the brand voice section', arguments: { section: 'voice' } }],
  brand_voice_validate: [{ title: 'Check an Instagram caption', arguments: { copy: 'Autumn is here. Our new single-origin roast is out now, in a limited batch.', platform: 'instagram' } }],
  brands_create: [{ title: 'Start a brand from its website', arguments: { brand_name: 'Acme Coffee', website_url: 'https://acmecoffee.example' } }],
  cad_query: [
    { title: 'Which CAD files and operations are supported', arguments: { action: 'capabilities' } },
    { title: 'Read a CAD file and its revisions', arguments: { action: 'asset', assetId: ASSET } },
  ],
  cad_manage: [{ title: 'Run manufacturing checks on a revision', arguments: { action: 'validate', brandId: ACCOUNT, assetId: ASSET, revisionId: 'c3e5a7b9d1f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4', requestId: '0d3f5b7a-9c1e-4a2b-8f4d-6b8a0c2e4f71', format: 'stl' } }],
  help_describe: [
    { title: 'List every registered tool', arguments: {} },
    { title: 'Fetch one action of a tool', arguments: { tool: 'paid_manage', action: 'create_campaign' } },
  ],
  insights_get: [{ title: 'Insights for one campaign', arguments: { account_id: ACCOUNT, scope: 'campaign', target_ids: ['120200000000000000'] } }],
  intel_competitor_ads: [{ title: 'Longest-running active competitor ads', arguments: { status: 'active', minDaysRunning: 30, sort: 'first_seen_at', dir: 'asc', limit: 10 } }],
  intel_competitor_moves: [{ title: 'What competitors ran in paid and organic since August', arguments: { source: 'all', since: '2026-08-01', limit: 20 } }],
  intel_competitor_organic: [{ title: "One competitor's recent organic posts", arguments: { competitorRef: 'Blue Bottle Coffee', limit: 10 } }],
  jaina_ask: [{ title: 'Ask Jaina directly', arguments: { query: 'Which ad sets spent the most last week without a purchase?' } }],
  jaina_pro_run: [{ title: 'A monthly campaign report', arguments: { reportSpec: { period: { start: '2026-10-01', end: '2026-10-31' }, scopes: ['campaign'], kpis: ['spend', 'roas', 'cpa'], format: 'mixed' } } }],
  mcp_approval_grant: [{ title: 'An Admin or Owner grants a pending change', arguments: { token: 'tok_9b1e5c2f4a7d3e60' } }],
  mcp_approvals_list: [{ title: 'Changes waiting for an Admin or Owner', arguments: {} }],
  media_search: [{ title: 'Find approved product shots', arguments: { query: 'flat lay of the coffee bag on a wooden table', kind: 'image', reviewStatus: 'approved', limit: 10 } }],
  media_upload_and_clip: [{ title: 'Start a signed upload of a long video', arguments: { file_name: 'founder-interview.mp4', mime_type: 'video/mp4', title: 'Founder interview', clip: true } }],
  optimizer_query: [{ title: "A portfolio's pending recommendations", arguments: { action: 'pending_recs', brand_id: ACCOUNT, portfolio_id: PORTFOLIO } }],
  optimizer_manage: [{ title: 'Approve one recommendation (the approval is the yes)', arguments: { action: 'set_recommendation_status', payload: { portfolio_id: PORTFOLIO, recommendation_id: RECOMMENDATION, status: 'approved' } } }],
  organic_ask: [{ title: 'Ask the Organic agent directly', arguments: { query: 'Which hooks worked best on our Reels this month?' } }],
  organic_draft_get: [{ title: 'Read one draft', arguments: { draftId: DRAFT } }],
  organic_draft_list: [{ title: 'Approved drafts ready to publish', arguments: { status: 'approved', publishable_only: true, limit: 20 } }],
  organic_workflow_run: [{ title: 'Plan next week end to end', arguments: { mode: 'plan_week', weekStart: '2026-11-16', timezone: 'America/New_York', brief: 'Lead with the autumn roast launch.' } }],
  paid_naming_schema_get: [{ title: 'The Meta naming convention', arguments: { platform: 'meta' } }],
  paid_naming_schema_set: [{ title: 'Set a Meta naming convention', arguments: { platform: 'meta', delimiter: '|', fields: ['funnel', 'format', 'audience'] } }],
  pipeline_search: [{ title: 'Find a saved pipeline', arguments: { query: 'product photo to lifestyle', limit: 5 } }],
  pipeline_describe: [{ title: 'What a pipeline needs', arguments: { pipeline_id: PIPELINE } }],
  pipeline_invoke: [{ title: 'Run a pipeline twice with different headlines', arguments: { pipeline_id: PIPELINE, family_id: FAMILY, revision: 3, contract_hash: '4e9f1c7a2b8d3e6f0a5c9b1d7e2f4a8c6b0d3e5f7a9c1b2d4e6f8a0c2e4b6d81', idempotency_key: 'autumn-launch-2026-11-09', runs: [{ text_inputs: [{ input_id: 'headline', value: 'Autumn roast, out now' }] }, { text_inputs: [{ input_id: 'headline', value: 'Limited batch: autumn roast' }] }] } }],
  pipeline_run_status: [{ title: 'Check a run', arguments: { run_ids: [RUN] } }],
  planner_manage: [
    { title: "Read next week's calendar", arguments: { action: 'get_week', week_start: '2026-11-16', timezone: 'America/New_York' } },
    { title: 'Propose a week of posts', arguments: { action: 'propose_week', week_start: '2026-11-16', timezone: 'America/New_York' } },
    { title: 'Move one post', arguments: { action: 'reschedule', draft_id: DRAFT, day: '2026-11-19', time_of_day: '09:30' } },
  ],
  post_audit: [{ title: 'Audit a draft caption before publishing', arguments: { account_id: ACCOUNT, content: { type: 'post', caption: 'Autumn is here. Our new single-origin roast is out now.', hashtags: ['#coffee', '#autumn'] }, audit_dimensions: ['brand_voice', 'hashtag_strategy'] } }],
  post_create_instagram: [{ title: 'Preview an image post (publish only after a yes)', arguments: { account_id: ACCOUNT, type: 'image', caption: 'Autumn is here. Our new single-origin roast is out now.', media: [{ type: 'image', source_url: 'https://cdn.example.com/autumn-roast.jpg' }], idempotency_key: 'autumn-roast-post-2026-11-09', mode: 'preview' } }],
  post_manage: [{ title: 'Move a scheduled post', arguments: { account_id: ACCOUNT, post_id: '17895695668004550', action: 'reschedule', schedule_at: '2026-11-20T15:00:00Z', idempotency_key: 'reschedule-17895695668004550-1120' } }],
  trends_manage: [{ title: "Read the brand's trends report", arguments: {} }],
  video_editor: [
    { title: 'List Video Studio projects', arguments: { action: 'list_projects' } },
    { title: 'Cut silences from a project', arguments: { action: 'cut_silence', projectId: ASSET, minSilenceSec: 0.6 } },
  ],
};

// Retired product names that can appear in server-written text (error reasons, summaries).
export const terms = { 'AI Studio canvas': 'AI Canvas', 'AI Studio': 'AI Canvas', 'brand guardrails': "brand's spend limits" };

// Behavior an agent needs in order to sequence calls, reviewed against each tool's server description.
export const goodToKnow = {
  agent_ask: [
    'Returns a `job_id` right away. Read the answer with `jobs_status`.',
    "The finished result's `status` is `completed` (it wrote a draft or plan) or `needs_followup` (text only). To continue, send the next question with the same `sessionId`.",
    'A question sent to the wrong agent returns `needs_correction` with a `suggested_target`.',
    'When the Organic agent ends with a plan waiting for approval, the result carries `plan_id` and `pending_approval_token`. Commit it with `planner_manage` `approve_week` after the person says yes.',
  ],
  jobs_status: ['Takes only `job_id`. In the result, `tool` is the tool you called and `executor` is the one that ran it.'],
  planner_manage: [
    '`propose_week` runs as a job. `proposal_status` returns its `plan_id` and a `pending_approval_token` that lasts 24 hours.',
    '`approve_week` commits the whole week in one step and is safe to repeat. The `job_id` from `propose_week` can stand in for `plan_id`, `pending_approval_token`, and `placements`.',
  ],
  content_create: [
    '`approve` returns the `confirm_token` that `publish` needs. Publish only after the person says yes.',
    '`realize` (generating the creative) and `delete` are two-phase: the first call previews and returns a token, the second confirms.',
    '`reference_assets` (up to 8 Library images) and `unsplash_photos` (up to 4) steer image generation, on `draft` and `realize` only.',
    'With `generate: false`, `draft` needs no `prompt` and saves the `caption` and `hashtags` you pass word for word.',
  ],
  paid_manage: [
    'Every write is two-phase: `params.mode: "preview"` returns a diff and a `confirm_token` that lasts 10 minutes; repeat the call with `params.mode: "confirm"` and the token.',
    "Campaigns, ad sets, ads, and copies are created paused. Activating one, raising a budget past the brand's limit (by default, more than 30%), or any write on a brand with an approval chain returns `APPROVAL_REQUIRED` until an Admin or Owner calls `mcp_approval_grant`.",
    '`batch` previews many writes under one token.',
    'Each write receipt includes `undo`: the call that reverses it, or null with the reason it can’t be undone.',
    'Boosting organic posts isn’t supported.',
  ],
  studio_workflow: [
    'Canvas reads and builds work on a workspace (`room_id`). `target: "library"` saves a reusable template instead.',
    '`delete` and `workspace_delete` are two-phase. A brand holds at most three workspaces.',
    'To make the creative for a Planner draft, pass `source_draft_id` to `build`.',
    '`run` without a `room_id` returns `needs_workspace`: ask the person to open the canvas in Continuum, then retry.',
  ],
  studio_deliver: [
    'Writes are two-phase and carry an `operation_id`: an exact retry replays the same receipt.',
    'A result marked `indeterminate` isn’t safe to retry blindly. Check the destination first.',
    '`replace_paid_creative` returns a restore handle; `restore_paid_creative` undoes the swap.',
  ],
  pipeline_invoke: [
    'Returns one receipt per run right away, usually `queued`. Read progress with `pipeline_run_status`.',
    'Reusing the same `idempotency_key` for the exact same request is safe. Use a new key for a new request.',
  ],
  video_editor: [
    "Every timeline edit names the project's current `revision` and returns the new one. `undo` restores the previous revision.",
    '`export` starts a render job that saves an MP4 to the Library. Poll `export_status` for its link.',
  ],
  unsplash_search: [
    'Photos are references, not Library assets: attach one to a canvas with `studio_workflow`, or pass it to `content_create` as `unsplash_photos`.',
    'Credit the photographer and Unsplash whenever you show a photo.',
  ],
  media_capture_url: ['Public https pages only: sign-in walls, private networks, and plain http are refused. A capture takes 10 to 40 seconds and returns Library asset ids.'],
  intel_competitor_scan: [
    'Answers once the first ads are stored (about 10 seconds) while the scan keeps running. Read results with `intel_competitor_ads` or `intel_competitor_moves`; `stillProcessing` above 0 means read again shortly.',
    'With fewer than 3 tracked competitors, it finds and tracks more itself.',
  ],
  forge_query: ['Per-action contracts, recipes, and recovery steps: [Forge functions](/forge/functions).'],
  forge_manage: ['`render_preview` returns a `confirmationToken` that `render_confirm` redeems. `set_delete` deletes with no preview, so ask first. Per-action contracts: [Forge functions](/forge/functions).'],
};

// Roles for tools that check them inside the handler rather than in their manifest surface.
// Each line was read from the tool's own gate call in continuum-backend App/mcp/tools.
export const roles = {
  agent_ask: 'Operator or higher.',
  analytics_query: 'Viewer or higher.',
  audience_query: 'Viewer or higher.',
  brand_knowledge: 'Viewer or higher to read. Operator or higher for `add_text`, `add_file`, `add_url`, `upload_url`, `upload_finalize`, `update`, `archive`, `restore`, and `save_permanent`.',
  content_create: 'Viewer or higher for `list`. Operator or higher for every other action.',
  creative_strategy: 'Viewer or higher to read. Operator or higher for `refresh`.',
  forge_query: 'Viewer or higher.',
  forge_manage: 'Operator or higher. Admin or Owner for `template_forge`, `template_set_default`, and renders with `final: true`.',
  headless_content: 'Viewer or higher for `guide`, `inspect`, and `status`. Operator or higher for every other action.',
  library_manage: 'Viewer or higher to read. Operator or higher for `comment_add`, `set_review_status`, `import_ad_creative`, `upload_inline`, `upload_url`, `upload_begin`, `upload_finalize`, and `render_retry`.',
  optimizer_query: 'Viewer or higher, on a brand with a Meta connection.',
  optimizer_manage: 'Operator or higher, on a brand with a Meta connection.',
  paid_manage: "Viewer or higher for `hierarchy` and `activity`. Operator or higher for writes. Admin or Owner to set `guardrails`. Activating an ad, or raising a budget past the brand's limit, needs an Admin or Owner's approval.",
  pipeline_invoke: 'Operator or higher, because a run can spend.',
  planner_manage: 'Viewer or higher for `get_week`, `proposal_status`, and `operation_status`. Operator or higher for every other action.',
  studio_deliver: 'Operator or higher.',
  studio_workflow: 'Operator or higher, for every action.',
  trends_manage: 'Viewer or higher. Operator or higher to force a fresh report with `force_regenerate`.',
  video_editor: 'Viewer or higher.',
};

// Per-action inputs for flat tools whose handler (not the schema) checks them, read from each
// handler's checks at continuum-backend d45c8a83b. 'a|b': one of them; 'a+b': together.
export const actionInputs = {
  brand_knowledge: {
    overview: { required: [], uses: [] },
    search: { required: ['query'], uses: ['sources', 'categories', 'limit'] },
    read: { required: ['source'], uses: ['full', 'purpose', 'section', 'design_section', 'format'] },
    validate: { required: ['copy', 'platform'], uses: [] },
    document_status: { required: ['document_id'], uses: [] },
    cross_reference: { required: [], uses: ['lens_limit'] },
    add_text: { required: ['name', 'text'], uses: ['category', 'retention'] },
    add_file: { required: ['file_name', 'mime_type', 'file_base64'], uses: ['category', 'operation_id'] },
    add_url: { required: ['name', 'url'], uses: ['category', 'retention'] },
    upload_url: { required: ['file_name', 'mime_type'], uses: [] },
    upload_finalize: { required: ['upload_path'], uses: ['name', 'category', 'retention'] },
    update: { required: ['document_id', 'name|category'], uses: ['expected_updated_at'] },
    archive: { required: ['document_id'], uses: ['mode', 'confirm_token'] },
    restore: { required: ['document_id'], uses: [] },
    save_permanent: { required: ['document_id'], uses: [] },
  },
  content_create: {
    list: { required: [], uses: ['publishable_only', 'listStatus', 'limit', 'cursor'] },
    draft: { required: ['platform', 'prompt'], uses: ['format', 'scheduledAt', 'accountId', 'timezone', 'reference_assets', 'unsplash_photos', 'generate', 'caption', 'hashtags', 'idempotency_key'] },
    extend: { required: ['draftId', 'updates|prompt'], uses: ['idempotency_key'] },
    realize: { required: ['draftId'], uses: ['preview_revision', 'regenerate', 'slides', 'prompt', 'reference_assets', 'unsplash_photos'] },
    approve: { required: ['draftId'], uses: [] },
    publish: { required: ['draftId', 'confirm_token'], uses: ['accountId', 'operation_id'] },
    delete: { required: ['draftId', 'mode'], uses: ['confirm_token', 'idempotency_key'] },
  },
  creative_strategy: {
    overview: { required: [], uses: [] },
    search: { required: ['query'], uses: ['kinds', 'surfaces', 'limit'] },
    read: { required: [], uses: ['insight_id'] },
    refresh: { required: [], uses: ['target'] },
    score_hook: { required: ['hook_text'], uses: ['mode'] },
    competitive_gaps: { required: [], uses: [] },
    winrates: { required: [], uses: ['scope', 'window', 'dimension', 'funnel_stage'] },
    vector_signals: { required: [], uses: ['window'] },
  },
  headless_content: {
    guide: { required: [], uses: ['portfolio_id', 'schema'] },
    inspect: { required: ['view'], uses: ['id', 'revision'] },
    status: { required: ['run_id'], uses: [] },
    create: { required: ['max_usd', 'guidance'], uses: ['dry_run', 'shortcuts', 'brandBook'] },
    create_spec: { required: ['max_usd', 'request_json'], uses: ['shortcuts', 'brandBook'] },
    create_stills: { required: ['max_usd', 'request_json'], uses: ['shortcuts', 'brandBook'] },
    act: { required: ['graph_action', 'payload_json'], uses: ['max_usd'] },
    style_draft: { required: ['payload_json'], uses: [] },
    recompose: { required: ['reel_asset_id', 'ops_json'], uses: [] },
  },
  library_manage: {
    browse: { required: [], uses: ['query', 'reviewStatus', 'kind', 'source', 'tags', 'limit', 'offset'] },
    asset_detail: { required: ['assetId'], uses: ['window'] },
    comment_add: { required: ['assetId', 'body'], uses: ['annotation', 'parentCommentId', 'operation_id'] },
    set_review_status: { required: ['assetId', 'toStatus'], uses: ['expectedCurrentStatus', 'note', 'operation_id'] },
    import_ad_creative: { required: ['creativeRowId'], uses: ['operation_id'] },
    upload_inline: { required: ['files'], uses: ['operation_id'] },
    upload_url: { required: ['uploads'], uses: [] },
    upload_finalize: { required: ['uploaded'], uses: [] },
    upload_begin: { required: [], uses: ['max_files'] },
    upload_status: { required: ['upload_intent_id'], uses: [] },
    render_status: { required: ['render_job_id'], uses: [] },
    render_retry: { required: ['render_job_id'], uses: [] },
  },
  planner_manage: {
    get_week: { required: [], uses: ['week_start', 'timezone'] },
    propose_week: { required: [], uses: ['week_start', 'timezone', 'platform_account_ids'] },
    proposal_status: { required: ['job_id'], uses: [] },
    approve_week: { required: ['job_id|plan_id+pending_approval_token+placements'], uses: ['operation_id'] },
    reschedule: { required: ['draft_id', 'day'], uses: ['time_of_day', 'expected_updated_at', 'timezone', 'atomicity', 'operation_id'] },
    reschedule_many: { required: ['targets'], uses: ['timezone', 'atomicity', 'operation_id'] },
    copy: { required: ['day', 'draft_ids|source_day'], uses: ['timezone', 'atomicity', 'operation_id'] },
    attach_media: { required: ['assets', 'draft_ids|draft_id'], uses: ['replace', 'expected_updated_at', 'atomicity', 'operation_id'] },
    bulk_transition: { required: ['to_status', 'draft_ids'], uses: ['mode', 'confirm_token', 'expected_updated_at', 'atomicity', 'operation_id'] },
    operation_status: { required: ['operation_id'], uses: [] },
  },
  studio_workflow: {
    get: { required: [], uses: ['workflow_id', 'room_id', 'target', 'name'] },
    list: { required: [], uses: [] },
    build: { required: ['nodes|source_draft_id'], uses: ['connections', 'target', 'room_id', 'mode', 'name', 'description', 'confirm_token'] },
    edit: { required: ['ops', 'target'], uses: ['workflow_id', 'expected_updated_at', 'room_id', 'seed_workflow_id', 'name', 'description', 'confirm_token'] },
    run: { required: ['room_id'], uses: ['workflow_id', 'node_ids', 'target'] },
    run_status: { required: ['run_request_id'], uses: [] },
    rename: { required: ['workflow_id', 'name'], uses: ['description'] },
    delete: { required: ['workflow_id'], uses: ['confirm_token'] },
    workspace_list: { required: [], uses: [] },
    workspace_create: { required: ['name'], uses: [] },
    workspace_delete: { required: ['room_id'], uses: ['confirm_token'] },
    save: { required: ['workflow_id', 'expected_updated_at', 'room_id'], uses: ['name', 'description'] },
    save_as_copy: { required: ['workflow_id|room_id'], uses: ['name', 'description'] },
  },
  content_reference: {
    inspect: { required: ['url'], uses: [] },
    recreate: { required: ['plan'], uses: ['mode', 'confirm_token', 'max_usd', 'footage_asset_ids'] },
  },
};
