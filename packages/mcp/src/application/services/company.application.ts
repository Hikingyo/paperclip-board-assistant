import type { CompanyRepository } from "../../domains/company/repository.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  CheckCompanyHealthQuery,
  CompanyHealthResponseDto,
  CompanyResponseDto,
  GetCompanyQuery,
  ListCompaniesQuery,
  PaginatedCompaniesResponseDto,
} from "../dtos/company.dto.js";

/**
 * Company Application Service
 * Orchestrates use cases for company domain
 * Handles DTO conversion and business logic orchestration
 */
export class CompanyApplicationService {
  constructor(private companyRepository: CompanyRepository) {}

  /**
   * Get company by ID (GetCompanyQuery)
   */
  async getCompany(query: GetCompanyQuery): Promise<Result<CompanyResponseDto>> {
    logger.debug("Application: Getting company", { id: query.id });

    const result = await this.companyRepository.findById(query.id);
    if (!result.ok) {
      return result as Result<CompanyResponseDto>;
    }

    const company = result.value;
    const budgetUtilization = company.getBudgetUtilization();

    return {
      ok: true,
      value: {
        id: company.id,
        name: company.name,
        description: company.description,
        status: company.status,
        issuePrefix: company.issuePrefix,
        issueCounter: company.issueCounter,
        budgetMonthlyCents: company.budgetMonthlyCents,
        spentMonthlyCents: company.spentMonthlyCents,
        budgetUtilization,
        isOverBudget: company.isOverBudget(),
        brandColor: company.brandColor,
        logoUrl: company.logoUrl,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    };
  }

  /**
   * List all companies (ListCompaniesQuery)
   */
  async listCompanies(query: ListCompaniesQuery): Promise<Result<PaginatedCompaniesResponseDto>> {
    logger.debug("Application: Listing companies", { query });

    const result = await this.companyRepository.findAll();
    if (!result.ok) {
      return result as Result<PaginatedCompaniesResponseDto>;
    }

    const companies = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;

    const items = companies.slice(offset, offset + limit).map((company) => ({
      id: company.id,
      name: company.name,
      description: company.description,
      status: company.status,
      issuePrefix: company.issuePrefix,
      issueCounter: company.issueCounter,
      budgetMonthlyCents: company.budgetMonthlyCents,
      spentMonthlyCents: company.spentMonthlyCents,
      budgetUtilization: company.getBudgetUtilization(),
      isOverBudget: company.isOverBudget(),
      brandColor: company.brandColor,
      logoUrl: company.logoUrl,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }));

    return {
      ok: true,
      value: {
        total: companies.length,
        count: items.length,
        offset,
        hasMore: offset + limit < companies.length,
        nextOffset: offset + limit < companies.length ? offset + limit : undefined,
        items,
      },
    };
  }

  /**
   * Check company health (CheckCompanyHealthQuery)
   */
  async checkCompanyHealth(
    query: CheckCompanyHealthQuery,
  ): Promise<Result<CompanyHealthResponseDto>> {
    logger.debug("Application: Checking company health", { id: query.id });

    const result = await this.companyRepository.findById(query.id);
    if (!result.ok) {
      return result as Result<CompanyHealthResponseDto>;
    }

    const company = result.value;

    return {
      ok: true,
      value: {
        companyId: company.id,
        isOverBudget: company.isOverBudget(),
        budgetUtilization: company.getBudgetUtilization(),
        status: company.status,
      },
    };
  }
}
