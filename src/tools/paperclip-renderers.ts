import type {
  PaginatedResult,
  PaperclipAdapter,
  PaperclipCompany,
  PaperclipCompanyBoardSummary,
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
