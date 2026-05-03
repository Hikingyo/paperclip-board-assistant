import type { Agent } from "../../domains/agent/entity.js";
import { AgentMapper } from "../../domains/agent/mapper.js";
import type { AgentRepository } from "../../domains/agent/repository.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import type { Result } from "../../shared/api/errors.js";
import { ApiPaths } from "../../shared/api/paths.js";
import { logger } from "../../shared/logging/logger.js";
import type { PaperclipAgent } from "../../types.js";

/**
 * Agent Repository Implementation
 */
export class PaperclipAgentRepository implements AgentRepository {
  constructor(
    private client: PaperclipApiClient,
    private companyId: string,
  ) {}

  async findById(id: string): Promise<Result<Agent>> {
    logger.debug("Fetching agent", { id });

    const result = await this.client.get<PaperclipAgent>(ApiPaths.agent(this.companyId, id));

    if (!result.ok) {
      return result as Result<Agent>;
    }

    return {
      ok: true,
      value: AgentMapper.toDomain(result.value),
    };
  }

  async findAll(): Promise<Result<Agent[]>> {
    logger.debug("Fetching all agents");

    const result = await this.client.get<PaperclipAgent[]>(ApiPaths.agents(this.companyId));

    if (!result.ok) {
      return result as Result<Agent[]>;
    }

    return {
      ok: true,
      value: AgentMapper.toDomainList(result.value),
    };
  }

  async findByCompanyId(companyId: string): Promise<Result<Agent[]>> {
    logger.debug("Fetching agents for company", { companyId });

    const result = await this.client.get<PaperclipAgent[]>(ApiPaths.agents(companyId));

    if (!result.ok) {
      return result as Result<Agent[]>;
    }

    return {
      ok: true,
      value: AgentMapper.toDomainList(result.value),
    };
  }
}
