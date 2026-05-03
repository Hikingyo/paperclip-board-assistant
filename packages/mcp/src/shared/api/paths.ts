/**
 * Typed API path builder to prevent hardcoded strings
 */

/**
 * Search parameters for API queries
 */
export interface SearchParams {
  limit?: number;
  offset?: number;
  status?: string;
  assigneeAgentId?: string;
  projectId?: string;
  [key: string]: string | number | undefined;
}

/**
 * Build URL search parameters from object
 */
function buildSearchParams(params: SearchParams): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return entries.length > 0 ? `?${entries.join("&")}` : "";
}

/**
 * API path builder with type-safe construction
 */
export const ApiPaths = {
  // Health & session
  health: () => "/api/health",
  session: () => "/api/auth/get-session",
  profile: () => "/api/auth/profile",

  // Companies
  companies: (params?: SearchParams) => `/api/companies${buildSearchParams(params || {})}`,
  company: (companyId: string) => `/api/companies/${companyId}`,

  // Agents
  agents: (companyId: string, params?: SearchParams) =>
    `/api/companies/${companyId}/agents${buildSearchParams(params || {})}`,
  agent: (companyId: string, agentId: string) => `/api/companies/${companyId}/agents/${agentId}`,

  // Projects
  projects: (companyId: string, params?: SearchParams) =>
    `/api/companies/${companyId}/projects${buildSearchParams(params || {})}`,
  project: (companyId: string, projectId: string) =>
    `/api/companies/${companyId}/projects/${projectId}`,

  // Issues/Tasks
  issues: (companyId: string, params?: SearchParams) =>
    `/api/companies/${companyId}/issues${buildSearchParams(params || {})}`,
  issue: (companyId: string, issueId: string) => `/api/companies/${companyId}/issues/${issueId}`,

  // Adapters & plugins
  adapters: (params?: SearchParams) => `/api/adapters${buildSearchParams(params || {})}`,
  plugins: (params?: SearchParams) => `/api/plugins${buildSearchParams(params || {})}`,
} as const;
