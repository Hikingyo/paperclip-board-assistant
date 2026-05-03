import type { Result } from "../../shared/api/errors.js";
import type { Company } from "./entity.js";

/**
 * Company Repository Interface
 * Defines contract for company data access
 */
export interface CompanyRepository {
  /**
   * Find company by ID
   */
  findById(id: string): Promise<Result<Company>>;

  /**
   * Get all companies for authenticated user
   */
  findAll(): Promise<Result<Company[]>>;

  /**
   * Get company with full details (members, workflows, etc)
   */
  findByIdWithDetails(id: string): Promise<Result<Company>>;
}
