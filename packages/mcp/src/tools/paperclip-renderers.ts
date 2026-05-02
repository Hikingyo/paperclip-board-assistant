import type {
  PaginatedResult,
  PaperclipAdapter,
  PaperclipCompany,
  PaperclipCompanyActivityFeed,
  PaperclipCompanyBoardSummary,
  PaperclipCompanyMetrics,
  PaperclipCompanyPolicies,
  PaperclipHealth,
  PaperclipPlugin,
  PaperclipProfile,
  PaperclipSession,
} from "../types.js";

function formatCurrencyFromCents(value: number | null): string {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

function formatBudgetStatus(value: PaperclipCompanyMetrics["budget_status"]): string {
  switch (value) {
    case "not_configured":
      return "Not configured";
    case "over_budget":
      return "Over budget";
    default:
      return "Within budget";
  }
}

function renderCompanyFacts(company: PaperclipCompany): string[] {
  return [
    `- **Status**: ${company.status}`,
    `- **Description**: ${company.description ?? "None"}`,
    `- **Issue prefix**: ${company.issuePrefix}`,
    `- **Current issue counter**: ${company.issueCounter}`,
    `- **Monthly budget**: ${formatCurrencyFromCents(company.budgetMonthlyCents)}`,
    `- **Monthly spend**: ${formatCurrencyFromCents(company.spentMonthlyCents)}`,
    `- **Board approval required for new agents**: ${company.requireBoardApprovalForNewAgents}`,
    `- **Feedback data sharing enabled**: ${company.feedbackDataSharingEnabled}`,
    `- **Attachment max bytes**: ${company.attachmentMaxBytes}`,
    `- **Brand color**: ${company.brandColor ?? "None"}`,
    `- **Logo URL**: ${company.logoUrl ?? "None"}`,
    `- **Created at**: ${company.createdAt}`,
    `- **Updated at**: ${company.updatedAt}`,
  ];
}

export function renderHealth(health: PaperclipHealth): string {
  const features =
    Object.entries(health.features)
      .map(([name, enabled]) => `- **${name}**: ${enabled}`)
      .join("\n") || "- No feature flags reported";

  return [
    "# Paperclip health",
    "",
    `- **Status**: ${health.status}`,
    `- **Version**: ${health.version}`,
    `- **Deployment mode**: ${health.deploymentMode}`,
    `- **Exposure**: ${health.deploymentExposure}`,
    `- **Auth ready**: ${health.authReady}`,
    `- **Bootstrap status**: ${health.bootstrapStatus}`,
    `- **Bootstrap invite active**: ${health.bootstrapInviteActive}`,
    "",
    "## Features",
    features,
  ].join("\n");
}

export function renderSession(session: PaperclipSession): string {
  if (!session.session || !session.user) {
    return "# Paperclip session\n\nNo active session was returned.";
  }

  return [
    "# Paperclip session",
    "",
    `- **Session ID**: ${session.session.id}`,
    `- **User ID**: ${session.session.userId}`,
    `- **User name**: ${session.user.name ?? "Unknown"}`,
    `- **Email**: ${session.user.email ?? "Unknown"}`,
    `- **Image**: ${session.user.image ?? "None"}`,
  ].join("\n");
}

export function renderProfile(profile: PaperclipProfile): string {
  return [
    "# Paperclip profile",
    "",
    `- **ID**: ${profile.id}`,
    `- **Name**: ${profile.name ?? "Unknown"}`,
    `- **Email**: ${profile.email ?? "Unknown"}`,
    `- **Image**: ${profile.image ?? "None"}`,
  ].join("\n");
}

export function renderCompanies(page: PaginatedResult<PaperclipCompany>): string {
  const blocks = page.items.map((company) =>
    [`## ${company.name} (${company.id})`, ...renderCompanyFacts(company)].join("\n"),
  );

  return [
    "# Paperclip companies",
    "",
    `Showing ${page.count} of ${page.total} companies from offset ${page.offset}.`,
    "",
    ...(blocks.length ? blocks : ["No companies found."]),
  ].join("\n");
}

export function renderCompany(company: PaperclipCompany): string {
  return [
    `# Paperclip company: ${company.name}`,
    "",
    `- **Company ID**: ${company.id}`,
    ...renderCompanyFacts(company),
  ].join("\n");
}

export function renderCompanyBoardSummary(summary: PaperclipCompanyBoardSummary): string {
  const { company, board_flags: boardFlags } = summary;

  return [
    `# Board summary: ${company.name}`,
    "",
    `- **Company ID**: ${company.id}`,
    `- **Status**: ${company.status}`,
    `- **Monthly budget**: ${formatCurrencyFromCents(company.budgetMonthlyCents)}`,
    `- **Monthly spend**: ${formatCurrencyFromCents(company.spentMonthlyCents)}`,
    `- **Budget remaining**: ${formatCurrencyFromCents(summary.budget_remaining_cents)}`,
    `- **Budget utilization**: ${summary.budget_utilization_percent ?? "Not set"}${
      summary.budget_utilization_percent === null ? "" : "%"
    }`,
    `- **Next issue number**: ${summary.next_issue_number}`,
    `- **Board approval required for new agents**: ${company.requireBoardApprovalForNewAgents}`,
    `- **Feedback data sharing enabled**: ${company.feedbackDataSharingEnabled}`,
    `- **Last updated**: ${company.updatedAt}`,
    "",
    "## Board flags",
    ...(boardFlags.length
      ? boardFlags.map((flag) => `- ${flag}`)
      : ["- No immediate board flags derived from company metadata."]),
  ].join("\n");
}

export function renderCompanyMetrics(metrics: PaperclipCompanyMetrics): string {
  const { company } = metrics;

  return [
    `# Company metrics: ${company.name}`,
    "",
    `- **Company ID**: ${company.id}`,
    `- **Monthly budget**: ${formatCurrencyFromCents(company.budgetMonthlyCents)}`,
    `- **Monthly spend**: ${formatCurrencyFromCents(company.spentMonthlyCents)}`,
    `- **Budget remaining**: ${formatCurrencyFromCents(metrics.budget_remaining_cents)}`,
    `- **Budget utilization**: ${metrics.budget_utilization_percent ?? "Not set"}${
      metrics.budget_utilization_percent === null ? "" : "%"
    }`,
    `- **Budget status**: ${formatBudgetStatus(metrics.budget_status)}`,
    `- **Current issue counter**: ${company.issueCounter}`,
    `- **Next issue number**: ${metrics.next_issue_number}`,
    `- **Attachment max bytes**: ${metrics.attachment_max_bytes}`,
    `- **Attachment max MiB**: ${metrics.attachment_max_mebibytes}`,
    `- **Last updated**: ${company.updatedAt}`,
  ].join("\n");
}

export function renderCompanyPolicies(policies: PaperclipCompanyPolicies): string {
  const { company, governance_flags: governanceFlags } = policies;

  return [
    `# Company policies: ${company.name}`,
    "",
    `- **Company ID**: ${company.id}`,
    `- **Board approval required for new agents**: ${policies.require_board_approval_for_new_agents}`,
    `- **Feedback data sharing enabled**: ${policies.feedback_data_sharing_enabled}`,
    `- **Feedback consent recorded at**: ${policies.feedback_data_sharing_consent_at ?? "None"}`,
    `- **Feedback consent recorded by user**: ${policies.feedback_data_sharing_consent_by_user_id ?? "None"}`,
    `- **Feedback terms version**: ${policies.feedback_data_sharing_terms_version ?? "None"}`,
    `- **Brand color**: ${policies.brand_color ?? "None"}`,
    `- **Logo asset ID**: ${policies.logo_asset_id ?? "None"}`,
    `- **Logo URL**: ${policies.logo_url ?? "None"}`,
    "",
    "## Governance flags",
    ...(governanceFlags.length
      ? governanceFlags.map((flag) => `- ${flag}`)
      : ["- No immediate governance flags derived from company metadata."]),
  ].join("\n");
}

export function renderCompanyActivityFeed(feed: PaperclipCompanyActivityFeed): string {
  const { company } = feed;
  const activityBlocks = feed.activity.map((event) =>
    [
      `## ${event.title}`,
      `- **Occurred at**: ${event.occurred_at}`,
      `- **Kind**: ${event.kind}`,
      `- **Summary**: ${event.summary}`,
    ].join("\n"),
  );

  return [
    `# Company activity feed: ${company.name}`,
    "",
    `- **Company ID**: ${company.id}`,
    `- **Derived from**: ${feed.derived_from}`,
    `- **Total events**: ${feed.total_events}`,
    `- **Latest event at**: ${feed.latest_event_at ?? "None"}`,
    "",
    "## Activity",
    ...(activityBlocks.length
      ? activityBlocks
      : ["No derived activity is available from the visible company metadata."]),
  ].join("\n");
}

export function renderAdapters(page: PaginatedResult<PaperclipAdapter>): string {
  const blocks = page.items.map((adapter) =>
    [
      `## ${adapter.label} (${adapter.type})`,
      `- **Source**: ${adapter.source}`,
      `- **Models count**: ${adapter.modelsCount}`,
      `- **Loaded**: ${adapter.loaded}`,
      `- **Disabled**: ${adapter.disabled}`,
      `- **Override paused**: ${adapter.overridePaused}`,
      `- **Supports instructions bundle**: ${adapter.capabilities.supportsInstructionsBundle}`,
      `- **Supports skills**: ${adapter.capabilities.supportsSkills}`,
      `- **Supports local agent JWT**: ${adapter.capabilities.supportsLocalAgentJwt}`,
      `- **Requires materialized runtime skills**: ${adapter.capabilities.requiresMaterializedRuntimeSkills}`,
    ].join("\n"),
  );

  return [
    "# Paperclip adapters",
    "",
    `Showing ${page.count} of ${page.total} adapters from offset ${page.offset}.`,
    "",
    ...(blocks.length ? blocks : ["No adapters found."]),
  ].join("\n");
}

export function renderPlugins(page: PaginatedResult<PaperclipPlugin>): string {
  const blocks = page.items.map((plugin, index) =>
    [
      `## ${plugin.name ?? plugin.slug ?? plugin.id ?? `Plugin ${page.offset + index + 1}`}`,
      `- **ID**: ${plugin.id ?? "Unknown"}`,
      `- **Slug**: ${plugin.slug ?? "Unknown"}`,
      `- **Status**: ${plugin.status ?? "Unknown"}`,
      `- **Source**: ${plugin.source ?? "Unknown"}`,
    ].join("\n"),
  );

  return [
    "# Paperclip plugins",
    "",
    `Showing ${page.count} of ${page.total} plugins from offset ${page.offset}.`,
    "",
    ...(blocks.length ? blocks : ["No plugins found."]),
  ].join("\n");
}
