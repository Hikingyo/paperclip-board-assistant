import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type { Agent } from "./entity.js";
import type { AgentRepository } from "./repository.js";

/**
 * Agent Service
 */
export class AgentService {
  constructor(private agentRepository: AgentRepository) {}

  async getAgent(id: string): Promise<Result<Agent>> {
    logger.debug("Getting agent", { id });
    return this.agentRepository.findById(id);
  }

  async listAgents(): Promise<Result<Agent[]>> {
    logger.debug("Listing all agents");
    return this.agentRepository.findAll();
  }

  async listAgentsByCompany(companyId: string): Promise<Result<Agent[]>> {
    logger.debug("Listing agents for company", { companyId });
    return this.agentRepository.findByCompanyId(companyId);
  }

  async checkAgentHealth(id: string): Promise<Result<boolean>> {
    const result = await this.agentRepository.findById(id);
    if (!result.ok) {
      return result as Result<boolean>;
    }

    return {
      ok: true,
      value: result.value.isHealthy(),
    };
  }
}
