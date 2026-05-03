export type ResponseFormat = "markdown" | "json";

export interface PaperclipHealth extends Record<string, unknown> {
  status: string;
  version: string;
  deploymentMode: string;
  deploymentExposure: string;
  authReady: boolean;
  bootstrapStatus: string;
  bootstrapInviteActive: boolean;
  features: Record<string, boolean>;
}

export interface PaperclipSessionUser extends Record<string, unknown> {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface PaperclipSession extends Record<string, unknown> {
  session: {
    id: string;
    userId: string;
  } | null;
  user: PaperclipSessionUser | null;
}

export interface PaperclipProfile extends Record<string, unknown> {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface PaperclipCompany extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  status: string;
  issuePrefix: string;
  issueCounter: number;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  attachmentMaxBytes: number;
  requireBoardApprovalForNewAgents: boolean;
  feedbackDataSharingEnabled: boolean;
  feedbackDataSharingConsentAt: string | null;
  feedbackDataSharingConsentByUserId: string | null;
  feedbackDataSharingTermsVersion: string | null;
  brandColor: string | null;
  logoAssetId: string | null;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
}

export interface PaperclipCompanyBoardSummary extends Record<string, unknown> {
  company: PaperclipCompany;
  budget_remaining_cents: number | null;
  budget_utilization_percent: number | null;
  next_issue_number: number;
  board_flags: string[];
}

export type PaperclipCompanyBudgetStatus = "not_configured" | "within_budget" | "over_budget";

export interface PaperclipCompanyMetrics extends Record<string, unknown> {
  company: PaperclipCompany;
  budget_status: PaperclipCompanyBudgetStatus;
  budget_remaining_cents: number | null;
  budget_utilization_percent: number | null;
  next_issue_number: number;
  attachment_max_bytes: number;
  attachment_max_mebibytes: number;
}

export interface PaperclipCompanyPolicies extends Record<string, unknown> {
  company: PaperclipCompany;
  require_board_approval_for_new_agents: boolean;
  feedback_data_sharing_enabled: boolean;
  feedback_data_sharing_consent_at: string | null;
  feedback_data_sharing_consent_by_user_id: string | null;
  feedback_data_sharing_terms_version: string | null;
  brand_color: string | null;
  logo_asset_id: string | null;
  logo_url: string | null;
  governance_flags: string[];
}

export type PaperclipCompanyActivityEventKind = "lifecycle" | "governance" | "board_flag";

export interface PaperclipCompanyActivityEvent extends Record<string, unknown> {
  id: string;
  kind: PaperclipCompanyActivityEventKind;
  occurred_at: string;
  title: string;
  summary: string;
}

export interface PaperclipCompanyActivityFeed extends Record<string, unknown> {
  company: PaperclipCompany;
  derived_from: "visible_company_metadata";
  total_events: number;
  latest_event_at: string | null;
  activity: PaperclipCompanyActivityEvent[];
}

export interface PaperclipCompanyExecutionSummaryCompany extends Record<string, unknown> {
  company_id: string;
  company_name: string;
  status: string;
  budget_status: PaperclipCompanyBudgetStatus;
  budget_utilization_percent: number | null;
  budget_remaining_cents: number | null;
  board_attention_needed: boolean;
  board_flags: string[];
  last_updated_at: string;
}

export interface PaperclipCompanyExecutionSummary extends Record<string, unknown> {
  derived_from: "visible_companies_metadata";
  total_companies: number;
  active_companies: number;
  companies_requiring_board_attention: number;
  over_budget_companies: number;
  board_approval_gated_companies: number;
  feedback_sharing_disabled_companies: number;
  total_monthly_budget_cents: number;
  total_monthly_spend_cents: number;
  total_budget_remaining_cents: number | null;
  portfolio_flags: string[];
  companies: PaperclipCompanyExecutionSummaryCompany[];
}

export interface PaperclipAdapter extends Record<string, unknown> {
  type: string;
  label: string;
  source: string;
  modelsCount: number;
  loaded: boolean;
  disabled: boolean;
  capabilities: {
    supportsInstructionsBundle: boolean;
    supportsSkills: boolean;
    supportsLocalAgentJwt: boolean;
    requiresMaterializedRuntimeSkills: boolean;
  };
  overridePaused: boolean;
}

export interface PaperclipPlugin extends Record<string, unknown> {
  id?: string;
  slug?: string;
  name?: string;
  status?: string;
  source?: string;
  [key: string]: unknown;
}

export interface PaginatedResult<T> extends Record<string, unknown> {
  total: number;
  count: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
  items: T[];
}
