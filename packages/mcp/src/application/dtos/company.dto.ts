/**
 * Company Application DTOs
 * Request and response objects for company use cases
 */

/**
 * Get Company Query
 */
export interface GetCompanyQuery {
  id: string;
}

/**
 * Company Response DTO
 */
export interface CompanyResponseDto {
  id: string;
  name: string;
  description: string | null;
  status: string;
  issuePrefix: string;
  issueCounter: number;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  budgetUtilization: number;
  isOverBudget: boolean;
  brandColor: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * List Companies Query
 */
export interface ListCompaniesQuery {
  limit?: number;
  offset?: number;
  status?: string;
}

/**
 * Paginated Companies Response
 */
export interface PaginatedCompaniesResponseDto {
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | undefined;
  items: CompanyResponseDto[];
}

/**
 * Company Health Query
 */
export interface CheckCompanyHealthQuery {
  id: string;
}

/**
 * Company Health Response
 */
export interface CompanyHealthResponseDto {
  companyId: string;
  isOverBudget: boolean;
  budgetUtilization: number;
  status: string;
}
