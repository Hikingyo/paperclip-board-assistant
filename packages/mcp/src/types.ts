export type ResponseFormat = "markdown" | "json";

export interface PaperclipHealth {
  status: string;
  version: string;
  deploymentMode: string;
  deploymentExposure: string;
  authReady: boolean;
  bootstrapStatus: string;
  bootstrapInviteActive: boolean;
  features: Record<string, boolean>;
}

export interface PaperclipSessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface PaperclipSession {
  session: {
    id: string;
    userId: string;
  } | null;
  user: PaperclipSessionUser | null;
}

export interface PaperclipProfile {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface PaperclipCompany {
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

export interface PaperclipCompanyBoardSummary {
  company: PaperclipCompany;
  budget_remaining_cents: number | null;
  budget_utilization_percent: number | null;
  next_issue_number: number;
  board_flags: string[];
}

export type PaperclipCompanyBudgetStatus = "not_configured" | "within_budget" | "over_budget";

export interface PaperclipCompanyMetrics {
  company: PaperclipCompany;
  budget_status: PaperclipCompanyBudgetStatus;
  budget_remaining_cents: number | null;
  budget_utilization_percent: number | null;
  next_issue_number: number;
  attachment_max_bytes: number;
  attachment_max_mebibytes: number;
}

export interface PaperclipCompanyPolicies {
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

export interface PaperclipCompanyActivityEvent {
  id: string;
  kind: PaperclipCompanyActivityEventKind;
  occurred_at: string;
  title: string;
  summary: string;
}

export interface PaperclipCompanyActivityFeed {
  company: PaperclipCompany;
  derived_from: "visible_company_metadata";
  total_events: number;
  latest_event_at: string | null;
  activity: PaperclipCompanyActivityEvent[];
}

export interface PaperclipCompanyExecutionSummaryCompany {
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

export interface PaperclipCompanyExecutionSummary {
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

export interface PaperclipAdapter {
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

export interface PaperclipPlugin {
  id?: string;
  slug?: string;
  name?: string;
  status?: string;
  source?: string;
  [key: string]: unknown;
}

export interface PaperclipAgent {
  id: string;
  companyId: string;
  name: string;
  role:
    | "ceo"
    | "cto"
    | "cmo"
    | "cfo"
    | "security"
    | "engineer"
    | "designer"
    | "pm"
    | "qa"
    | "devops"
    | "researcher"
    | "general";
  title: string | null;
  icon: string | null;
  status: "active" | "idle" | "paused" | "pending_approval";
  reportsTo: string | null;
  capabilities: string | null;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
  runtimeConfig: Record<string, unknown>;
  defaultEnvironmentId: string | null;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  pauseReason: string | null;
  pausedAt: string | null;
  permissions: {
    canCreateAgents: boolean;
  };
  lastHeartbeatAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
}

export interface PaperclipWorkspace {
  id: string;
  companyId: string;
  projectId: string;
  name: string;
  sourceType: string;
  cwd: string;
  repoUrl: string | null;
  repoRef: string | null;
  defaultRef: string | null;
  visibility: string;
  setupCommand: string | null;
  cleanupCommand: string | null;
  remoteProvider: string | null;
  remoteWorkspaceRef: string | null;
  sharedWorkspaceKey: string | null;
  metadata: Record<string, unknown> | null;
  runtimeConfig: Record<string, unknown> | null;
  isPrimary: boolean;
  runtimeServices: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface PaperclipProject {
  id: string;
  companyId: string;
  goalId: string | null;
  name: string;
  description: string | null;
  status: "in_progress" | "paused" | "completed" | "archived";
  leadAgentId: string | null;
  targetDate: string | null;
  color: string;
  env: string | null;
  pauseReason: string | null;
  pausedAt: string | null;
  executionWorkspacePolicy: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
  goalIds: string[];
  goals: Array<{
    id: string;
    title: string;
  }>;
  codebase: {
    workspaceId: string;
    repoUrl: string;
    repoRef: string | null;
    defaultRef: string | null;
    repoName: string;
    localFolder: string;
    managedFolder: string;
    effectiveLocalFolder: string;
    origin: string;
  };
  workspaces: PaperclipWorkspace[];
  primaryWorkspace: PaperclipWorkspace;
}

export interface PaperclipIssue {
  id: string;
  companyId: string;
  projectId: string | null;
  projectWorkspaceId: string | null;
  goalId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  status: "open" | "in_progress" | "in_review" | "done" | "cancelled";
  priority: "trivial" | "low" | "medium" | "high" | "critical";
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  createdByAgentId: string | null;
  createdByUserId: string | null;
  issueNumber: number;
  identifier: string;
  originKind: string;
  originId: string | null;
  requestDepth: number;
  billingCode: string | null;
  executionPolicy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  hiddenAt: string | null;
  createdAt: string;
  updatedAt: string;
  labels: Array<{
    id: string;
    name: string;
  }>;
  labelIds: string[];
  lastActivityAt: string | null;
  blockerAttention: {
    state: string;
    reason: string | null;
    unresolvedBlockerCount: number;
    coveredBlockerCount: number;
    stalledBlockerCount: number;
    attentionBlockerCount: number;
    sampleBlockerIdentifier: string | null;
    sampleStalledBlockerIdentifier: string | null;
  };
}

export interface PaperclipRoutine {
  id: string;
  name: string;
}

export interface PaperclipRoutineRun {
  id: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaperclipRoutineSchedule {
  nextRunAt: string;
  frequency: string;
}

export interface PaginatedResult<T> {
  total: number;
  count: number;
  offset: number;
  has_more: boolean;
  next_offset?: number;
  items: T[];
}
