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
    slug: 'creative', title: 'Creative+ canvas, Library, video, and Forge', sidebarTitle: 'Creative+',
    description: 'MCP tools for canvas workflows, pipelines, Elements, the Library, Video Studio, Forge, stock photos, page captures, and CAD files: inputs, examples, and errors.',
    tools: {
      studio_workflow: 'Builds, edits, runs, saves, and lists canvas workflows.',
      studio_deliver: 'Previews and sends finished creative to a planned post, an organic publish, or a live ad, and restores a swapped ad.',
      pipeline_search: "Finds your team's saved pipelines.",
      pipeline_describe: 'Shows what a pipeline needs.',
      pipeline_invoke: 'Runs a pipeline, up to 10 versions per request.',
      pipeline_run_status: 'Checks a pipeline run.',
      list_elements: 'Lists your saved Elements.',
      library_manage: 'Browses the Library, shows where a creative has run, adds comments, sets review status, and uploads media.',
      media_search: 'Finds media by describing it.',
      media_upload_and_clip: 'Uploads a video to clip. Clipping finishes in the Continuum app.',
      media_capture_url: 'Turns a public web page into a screenshot or a scroll-through video in your Library.',
      unsplash_search: 'Searches Unsplash stock photos to use as references.',
      video_editor: 'Edits video in Video Studio: cut silences, cut to the beat, captions, text, music, formats, export, and undo.',
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
    '`approve_week` commits the whole week in one step and is safe to repeat.',
  ],
  content_create: [
    '`approve` returns the `confirm_token` that `publish` needs. Publish only after the person says yes.',
    '`realize` (generating the creative) and `delete` are two-phase: the first call previews and returns a token, the second confirms.',
    '`reference_assets` (up to 8 Library images) and `unsplash_photos` (up to 4) steer image generation.',
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
