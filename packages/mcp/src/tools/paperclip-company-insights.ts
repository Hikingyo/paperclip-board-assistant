import type {
  PaperclipCompany,
  PaperclipCompanyActivityEvent,
  PaperclipCompanyActivityFeed,
  PaperclipCompanyBoardSummary,
  PaperclipCompanyExecutionSummary,
  PaperclipCompanyExecutionSummaryCompany,
  PaperclipCompanyMetrics,
  PaperclipCompanyPolicies,
} from "../types.js";

function getGovernanceFlags(company: PaperclipCompany): string[] {
  const flags: string[] = [];

  if (company.requireBoardApprovalForNewAgents) {
    flags.push("New agent creation requires board approval.");
  }

  if (!company.feedbackDataSharingEnabled) {
    flags.push("Feedback data sharing is disabled.");
  }

  if (company.feedbackDataSharingEnabled && !company.feedbackDataSharingConsentAt) {
    flags.push("Feedback data sharing is enabled but consent metadata is incomplete.");
  }

  return flags;
}

export function buildCompanyBoardSummary(company: PaperclipCompany): PaperclipCompanyBoardSummary {
  return {
    company_id: company.id,
    company_name: company.name,
    board_flags: getGovernanceFlags(company),
  };
}

export function buildCompanyMetrics(company: PaperclipCompany): PaperclipCompanyMetrics {
  const budgetMonthlyCents = company.budgetMonthlyCents;
  const spentMonthlyCents = company.spentMonthlyCents;
  const budgetStatus =
    budgetMonthlyCents > 0 && spentMonthlyCents > budgetMonthlyCents ? "over_budget" : "within_budget";

  return {
    company_id: company.id,
    company_name: company.name,
    budget_status: budgetStatus,
    budget_utilization_percent: budgetMonthlyCents > 0 ? Math.round((spentMonthlyCents / budgetMonthlyCents) * 100) : null,
    budget_remaining_cents: budgetMonthlyCents > 0 ? budgetMonthlyCents - spentMonthlyCents : null,
  };
}

export function buildCompanyPolicies(company: PaperclipCompany): PaperclipCompanyPolicies {
  return {
    company_id: company.id,
    company_name: company.name,
    require_board_approval_for_new_agents: company.requireBoardApprovalForNewAgents,
    feedback_data_sharing_enabled: company.feedbackDataSharingEnabled,
    feedback_data_sharing_consent_at: company.feedbackDataSharingConsentAt,
    feedback_data_sharing_consent_by_user_id: company.feedbackDataSharingConsentByUserId,
    feedback_data_sharing_terms_version: company.feedbackDataSharingTermsVersion,
    brand_color: company.brandColor,
    logo_asset_id: company.logoAssetId,
    logo_url: company.logoUrl,
    governance_flags: getGovernanceFlags(company),
  };
}

function compareActivityEvents(
  left: PaperclipCompanyActivityEvent,
  right: PaperclipCompanyActivityEvent,
): number {
  const byTimestamp = right.occurred_at.localeCompare(left.occurred_at);
  if (byTimestamp !== 0) {
    return byTimestamp;
  }

  return left.id.localeCompare(right.id);
}

export function buildCompanyActivityFeed(company: PaperclipCompany): PaperclipCompanyActivityFeed {
  const boardSummary = buildCompanyBoardSummary(company);
  const activity: PaperclipCompanyActivityEvent[] = [
    {
      id: "company-created",
      kind: "lifecycle",
      occurred_at: company.createdAt,
      title: "Company created",
      summary: `${company.name} became visible with status ${company.status}.`,
    },
  ];

  if (company.updatedAt !== company.createdAt) {
    activity.push({
      id: "company-metadata-updated",
      kind: "lifecycle",
      occurred_at: company.updatedAt,
      title: "Company metadata updated",
      summary: `Latest visible metadata shows status ${company.status} and issue counter ${company.issueCounter}.`,
    });
  }

  if (company.feedbackDataSharingEnabled && company.feedbackDataSharingConsentAt) {
    activity.push({
      id: "feedback-data-sharing-consent-recorded",
      kind: "governance",
      occurred_at: company.feedbackDataSharingConsentAt,
      title: "Feedback sharing consent recorded",
      summary: `Consent was recorded for terms version ${
        company.feedbackDataSharingTermsVersion ?? "unknown"
      } by user ${company.feedbackDataSharingConsentByUserId ?? "unknown"}.`,
    });
  }

  activity.push(
    ...boardSummary.board_flags.map((flag, index) => ({
      id: `board-flag-${index + 1}`,
      kind: "board_flag" as const,
      occurred_at: company.updatedAt,
      title: "Board signal visible in latest snapshot",
      summary: flag,
    })),
  );

  activity.sort(compareActivityEvents);

  return {
    company,
    derived_from: "visible_company_metadata",
    total_events: activity.length,
    latest_event_at: activity[0]?.occurred_at ?? null,
    activity,
  };
}

function compareExecutionSummaryCompanies(
  left: PaperclipCompanyExecutionSummaryCompany,
  right: PaperclipCompanyExecutionSummaryCompany,
): number {
  if (left.board_attention_needed !== right.board_attention_needed) {
    return Number(right.board_attention_needed) - Number(left.board_attention_needed);
  }

  return right.last_updated_at.localeCompare(left.last_updated_at);
}

function getPortfolioFlags(summary: PaperclipCompanyExecutionSummary): string[] {
  const flags: string[] = [];

  if (summary.total_companies === 0) {
    flags.push("No companies are visible from the current Paperclip session.");
  }

  if (summary.companies_requiring_board_attention > 0) {
    flags.push(
      `${summary.companies_requiring_board_attention} visible compan${
        summary.companies_requiring_board_attention === 1 ? "y requires" : "ies require"
      } board attention.`,
    );
  }

  if (summary.over_budget_companies > 0) {
    flags.push(
      `${summary.over_budget_companies} compan${
        summary.over_budget_companies === 1 ? "y is" : "ies are"
      } over budget.`,
    );
  }

  if (summary.board_approval_gated_companies > 0) {
    flags.push(
      `New agent creation is board-gated in ${summary.board_approval_gated_companies} compan${
        summary.board_approval_gated_companies === 1 ? "y" : "ies"
      }.`,
    );
  }

  if (summary.feedback_sharing_disabled_companies > 0) {
    flags.push(
      `Feedback data sharing is disabled in ${summary.feedback_sharing_disabled_companies} compan${
        summary.feedback_sharing_disabled_companies === 1 ? "y" : "ies"
      }.`,
    );
  }

  return flags;
}

export function buildCompanyExecutionSummary(
  companies: PaperclipCompany[],
): PaperclipCompanyExecutionSummary {
  const companySummaries = companies
    .map((company) => {
      const boardSummary = buildCompanyBoardSummary(company);
      const metrics = buildCompanyMetrics(company);

      return {
        company_id: company.id,
        company_name: company.name,
        status: company.status,
        budget_status: metrics.budget_status,
        budget_utilization_percent: metrics.budget_utilization_percent,
        budget_remaining_cents: metrics.budget_remaining_cents,
        board_attention_needed: boardSummary.board_flags.length > 0,
        board_flags: boardSummary.board_flags,
        last_updated_at: company.updatedAt,
      } satisfies PaperclipCompanyExecutionSummaryCompany;
    })
    .sort(compareExecutionSummaryCompanies);

  const totalMonthlyBudgetCents = companies.reduce(
    (sum, company) => sum + company.budgetMonthlyCents,
    0,
  );
  const totalMonthlySpendCents = companies.reduce(
    (sum, company) => sum + company.spentMonthlyCents,
    0,
  );

  const summary: PaperclipCompanyExecutionSummary = {
    derived_from: "visible_companies_metadata",
    total_companies: companies.length,
    active_companies: companies.filter((company) => company.status === "active").length,
    companies_requiring_board_attention: companySummaries.filter(
      (company) => company.board_attention_needed,
    ).length,
    over_budget_companies: companySummaries.filter(
      (company) => company.budget_status === "over_budget",
    ).length,
    board_approval_gated_companies: companies.filter(
      (company) => company.requireBoardApprovalForNewAgents,
    ).length,
    feedback_sharing_disabled_companies: companies.filter(
      (company) => !company.feedbackDataSharingEnabled,
    ).length,
    total_monthly_budget_cents: totalMonthlyBudgetCents,
    total_monthly_spend_cents: totalMonthlySpendCents,
    total_budget_remaining_cents:
      totalMonthlyBudgetCents > 0 ? totalMonthlyBudgetCents - totalMonthlySpendCents : null,
    portfolio_flags: [],
    companies: companySummaries,
  };

  summary.portfolio_flags = getPortfolioFlags(summary);

  return summary;
}
