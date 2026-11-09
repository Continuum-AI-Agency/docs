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
