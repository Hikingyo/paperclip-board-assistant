import type {
  PaperclipCompany,
  PaperclipCompanyBoardSummary,
  PaperclipCompanyBudgetStatus,
  PaperclipCompanyMetrics,
  PaperclipCompanyPolicies,
} from "../types.js";

function getBudgetStatus(company: PaperclipCompany): PaperclipCompanyBudgetStatus {
  if (company.budgetMonthlyCents <= 0) {
    return "not_configured";
  }

  if (company.spentMonthlyCents > company.budgetMonthlyCents) {
    return "over_budget";
  }

  return "within_budget";
}

function getBudgetRemaining(company: PaperclipCompany): number | null {
  return company.budgetMonthlyCents > 0
    ? company.budgetMonthlyCents - company.spentMonthlyCents
    : null;
}

function getBudgetUtilization(company: PaperclipCompany): number | null {
  return company.budgetMonthlyCents > 0
    ? Number(((company.spentMonthlyCents / company.budgetMonthlyCents) * 100).toFixed(1))
    : null;
}

function getGovernanceFlags(company: PaperclipCompany): string[] {
  const flags: string[] = [];

  if (company.requireBoardApprovalForNewAgents) {
    flags.push("New agent creation is gated behind board approval.");
  }

  if (!company.feedbackDataSharingEnabled) {
    flags.push("Feedback data sharing is disabled.");
  } else if (
    !company.feedbackDataSharingConsentAt ||
    !company.feedbackDataSharingConsentByUserId ||
    !company.feedbackDataSharingTermsVersion
  ) {
    flags.push("Feedback data sharing is enabled but consent metadata is incomplete.");
  }

  return flags;
}

function getBudgetFlags(company: PaperclipCompany): string[] {
  switch (getBudgetStatus(company)) {
    case "not_configured":
      return ["Monthly budget is not configured."];
    case "over_budget":
      return ["Monthly spend is above the configured budget."];
    default:
      return [];
  }
}

export function buildCompanyBoardSummary(company: PaperclipCompany): PaperclipCompanyBoardSummary {
  return {
    company,
    budget_remaining_cents: getBudgetRemaining(company),
    budget_utilization_percent: getBudgetUtilization(company),
    next_issue_number: company.issueCounter + 1,
    board_flags: [...getGovernanceFlags(company), ...getBudgetFlags(company)],
  };
}

export function buildCompanyMetrics(company: PaperclipCompany): PaperclipCompanyMetrics {
  return {
    company,
    budget_status: getBudgetStatus(company),
    budget_remaining_cents: getBudgetRemaining(company),
    budget_utilization_percent: getBudgetUtilization(company),
    next_issue_number: company.issueCounter + 1,
    attachment_max_bytes: company.attachmentMaxBytes,
    attachment_max_mebibytes: Number((company.attachmentMaxBytes / (1024 * 1024)).toFixed(2)),
  };
}

export function buildCompanyPolicies(company: PaperclipCompany): PaperclipCompanyPolicies {
  return {
    company,
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
