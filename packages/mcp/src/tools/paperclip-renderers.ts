import type {
  PaginatedResult,
  PaperclipAdapter,
  PaperclipAgent,
  PaperclipCompany,
  PaperclipCompanyActivityFeed,
  PaperclipCompanyBoardSummary,
  PaperclipCompanyExecutionSummary,
  PaperclipCompanyMetrics,
  PaperclipCompanyPolicies,
  PaperclipHealth,
  PaperclipIssue,
  PaperclipPlugin,
  PaperclipProfile,
  PaperclipProject,
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

function formatBudgetUtilization(value: number | null): string {
  return `${value ?? "Not set"}${value === null ? "" : "%"}`;
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

export function renderCompanyExecutionSummary(summary: PaperclipCompanyExecutionSummary): string {
  const companyBlocks = summary.companies.map(
    (company: PaperclipCompanyExecutionSummary["companies"][number]) =>
      [
        `## ${company.company_name} (${company.company_id})`,
        `- **Status**: ${company.status}`,
        `- **Board attention needed**: ${company.board_attention_needed}`,
        `- **Budget status**: ${formatBudgetStatus(company.budget_status)}`,
        `- **Budget utilization**: ${formatBudgetUtilization(company.budget_utilization_percent)}`,
        `- **Budget remaining**: ${formatCurrencyFromCents(company.budget_remaining_cents)}`,
        `- **Last updated**: ${company.last_updated_at}`,
        ...(company.board_flags.length
          ? ["- **Board flags**:", ...company.board_flags.map((flag: string) => `  - ${flag}`)]
          : ["- **Board flags**: None"]),
      ].join("\n"),
  );

  return [
    "# Company execution summary",
    "",
    `- **Derived from**: ${summary.derived_from}`,
    `- **Visible companies**: ${summary.total_companies}`,
    `- **Active companies**: ${summary.active_companies}`,
    `- **Companies requiring board attention**: ${summary.companies_requiring_board_attention}`,
    `- **Over-budget companies**: ${summary.over_budget_companies}`,
    `- **Board approval gated companies**: ${summary.board_approval_gated_companies}`,
    `- **Feedback sharing disabled companies**: ${summary.feedback_sharing_disabled_companies}`,
    `- **Total monthly budget**: ${formatCurrencyFromCents(summary.total_monthly_budget_cents)}`,
    `- **Total monthly spend**: ${formatCurrencyFromCents(summary.total_monthly_spend_cents)}`,
    `- **Total budget remaining**: ${formatCurrencyFromCents(summary.total_budget_remaining_cents)}`,
    "",
    "## Portfolio flags",
    ...(summary.portfolio_flags.length
      ? summary.portfolio_flags.map((flag: string) => `- ${flag}`)
      : ["- No immediate portfolio flags derived from visible company metadata."]),
    "",
    "## Company focus",
    ...(companyBlocks.length ? companyBlocks : ["No companies are visible."]),
  ].join("\n");
}

export function renderAgents(page: PaginatedResult<PaperclipAgent>): string {
  const agentLines = page.items
    .map(
      (agent) =>
        `- **${agent.name}** (${agent.role}) - ${agent.status}${agent.title ? ` - ${agent.title}` : ""}`,
    )
    .join("\n");

  return [
    "# Agents",
    "",
    `Showing ${page.count} of ${page.total} agents from offset ${page.offset}.`,
    "",
    agentLines.length ? agentLines : "No agents found.",
  ].join("\n");
}

export function renderAgent(agent: PaperclipAgent): string {
  const lines = [`# ${agent.name}`, `**Role**: ${agent.role} | **Status**: ${agent.status}`, ""];

  if (agent.title) {
    lines.push(`**Title**: ${agent.title}`);
  }

  if (agent.capabilities) {
    lines.push(`**Capabilities**: ${agent.capabilities}`);
  }

  if (agent.reportsTo) {
    lines.push(`**Reports to**: ${agent.reportsTo}`);
  }

  lines.push(
    `**Budget**: $${(agent.budgetMonthlyCents / 100).toFixed(2)} (spent: $${(agent.spentMonthlyCents / 100).toFixed(2)})`,
  );

  if (agent.pauseReason) {
    lines.push(`**Paused**: ${agent.pauseReason}`);
  }

  if (agent.lastHeartbeatAt) {
    lines.push(`**Last heartbeat**: ${agent.lastHeartbeatAt}`);
  }

  lines.push(`**Created**: ${agent.createdAt}`);
  lines.push(`**URL**: ${agent.urlKey}`);

  return lines.join("\n");
}

export function renderProjects(page: PaginatedResult<PaperclipProject>): string {
  const projectLines = page.items
    .map(
      (project) =>
        `- **${project.name}** (${project.status})${project.description ? ` - ${project.description}` : ""}`,
    )
    .join("\n");

  return [
    "# Projects",
    "",
    `Showing ${page.count} of ${page.total} projects from offset ${page.offset}.`,
    "",
    projectLines.length ? projectLines : "No projects found.",
  ].join("\n");
}

export function renderProject(project: PaperclipProject): string {
  const lines = [
    `# ${project.name}`,
    `**Status**: ${project.status} | **Color**: ${project.color}`,
    "",
  ];

  if (project.description) {
    lines.push(`**Description**: ${project.description}`);
  }

  if (project.goals.length) {
    lines.push("**Goals**:");
    project.goals.forEach((goal) => {
      lines.push(`- ${goal.title}`);
    });
  }

  if (project.leadAgentId) {
    lines.push(`**Lead Agent**: ${project.leadAgentId}`);
  }

  if (project.targetDate) {
    lines.push(`**Target Date**: ${project.targetDate}`);
  }

  if (project.pauseReason) {
    lines.push(`**Pause Reason**: ${project.pauseReason}`);
  }

  if (project.codebase?.repoUrl) {
    lines.push(`**Repository**: ${project.codebase.repoUrl}`);
  }

  lines.push(`**Created**: ${project.createdAt}`);
  lines.push(`**URL**: ${project.urlKey}`);

  return lines.join("\n");
}

export function renderIssues(page: PaginatedResult<PaperclipIssue>): string {
  const issueLines = page.items
    .map(
      (issue) =>
        `- [${issue.identifier}](${issue.identifier}) **${issue.title}** (${issue.status}) [${issue.priority}]${issue.assigneeAgentId ? ` - Assigned` : ""}`,
    )
    .join("\n");

  return [
    "# Issues/Tasks",
    "",
    `Showing ${page.count} of ${page.total} issues from offset ${page.offset}.`,
    "",
    issueLines.length ? issueLines : "No issues found.",
  ].join("\n");
}

export function renderIssue(issue: PaperclipIssue): string {
  const lines = [
    `# ${issue.identifier}: ${issue.title}`,
    `**Status**: ${issue.status} | **Priority**: ${issue.priority}`,
    "",
  ];

  if (issue.description) {
    lines.push("## Description");
    lines.push(issue.description);
    lines.push("");
  }

  if (issue.assigneeAgentId) {
    lines.push(`**Assigned to**: Agent ${issue.assigneeAgentId}`);
  }

  if (issue.parentId) {
    lines.push(`**Parent Issue**: ${issue.parentId}`);
  }

  if (issue.blockerAttention.unresolvedBlockerCount > 0) {
    lines.push(
      `**Blocked by**: ${issue.blockerAttention.unresolvedBlockerCount} unresolved blocker(s)`,
    );
  }

  if (issue.labels.length) {
    lines.push(`**Labels**: ${issue.labels.map((l) => l.name).join(", ")}`);
  }

  if (issue.startedAt) {
    lines.push(`**Started**: ${issue.startedAt}`);
  }

  if (issue.completedAt) {
    lines.push(`**Completed**: ${issue.completedAt}`);
  }

  if (issue.projectId) {
    lines.push(`**Project**: ${issue.projectId}`);
  }

  lines.push(`**Created**: ${issue.createdAt}`);
  lines.push(`**Last Activity**: ${issue.lastActivityAt ?? "None"}`);

  return lines.join("\n");
}
