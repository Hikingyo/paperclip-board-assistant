import type { Result } from "../../shared/api/errors.js";
import type { Company } from "./entity.js";
import type { CompanyRepository } from "./repository.js";

/**
 * Company Service
 * Orchestrates company domain logic and use cases
 */
export class CompanyService {
  constructor(private companyRepository: CompanyRepository) {}

  /**
   * Get company by ID with validation
   */
  async getCompany(id: string): Promise<Result<Company>> {
    if (!id || id.trim().length === 0) {
      return {
        ok: false,
        error: new Error("Invalid company ID") as any,
      };
    }
    return this.companyRepository.findById(id);
  }

  /**
   * Get all accessible companies
   */
  async listCompanies(): Promise<Result<Company[]>> {
    return this.companyRepository.findAll();
  }

  /**
   * Get company with full details
   */
  async getCompanyDetails(id: string): Promise<Result<Company>> {
    return this.companyRepository.findByIdWithDetails(id);
  }

  /**
   * Check if company needs attention (blocker alert)
   */
  async checkCompanyHealth(id: string): Promise<Result<boolean>> {
    const result = await this.companyRepository.findById(id);
    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      value: result.value.isOverBudget(),
    };
  }
}
