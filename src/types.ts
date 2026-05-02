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
