import type { Company } from "../../domains/company/entity.js";
import { CompanyMapper } from "../../domains/company/mapper.js";
import type { CompanyRepository } from "../../domains/company/repository.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import type { Result } from "../../shared/api/errors.js";
import { ApiPaths } from "../../shared/api/paths.js";
import { logger } from "../../shared/logging/logger.js";
import type { PaperclipCompany } from "../../types.js";

/**
 * Company Repository Implementation
 * Fetches company data from Paperclip API
 */
export class PaperclipCompanyRepository implements CompanyRepository {
  constructor(private client: PaperclipApiClient) {}

  async findById(id: string): Promise<Result<Company>> {
    logger.debug("Fetching company", { id });

    const result = await this.client.get<PaperclipCompany>(ApiPaths.company(id));

    if (!result.ok) {
      return result as Result<Company>;
    }

    return {
      ok: true,
      value: CompanyMapper.toDomain(result.value),
    };
  }

  async findAll(): Promise<Result<Company[]>> {
    logger.debug("Fetching all companies");

    const result = await this.client.get<PaperclipCompany[]>(ApiPaths.companies());

    if (!result.ok) {
      return result as Result<Company[]>;
    }

    return {
      ok: true,
      value: CompanyMapper.toDomainList(result.value),
    };
  }

  async findByIdWithDetails(id: string): Promise<Result<Company>> {
    logger.debug("Fetching company with details", { id });

    const result = await this.client.get<PaperclipCompany>(ApiPaths.company(id));

    if (!result.ok) {
      return result as Result<Company>;
    }

    return {
      ok: true,
      value: CompanyMapper.toDomain(result.value),
    };
  }
}
