import type { AgentService } from "../../domains/agent/service.js";
import type { Result } from "../../shared/api/errors.js";
import { logger } from "../../shared/logging/logger.js";
import type {
  AgentHealthResponseDto,
  AgentResponseDto,
  CheckAgentHealthQuery,
  GetAgentQuery,
  ListAgentsQuery,
  PaginatedAgentsResponseDto,
} from "../dtos/agent.dto.js";

/**
 * Agent Application Service
 * Orchestrates use cases for agent domain
 */
export class AgentApplicationService {
  constructor(private agentService: AgentService) {}

  /**
   * Get agent by ID (GetAgentQuery)
   */
  async getAgent(query: GetAgentQuery): Promise<Result<AgentResponseDto>> {
    logger.debug("Application: Getting agent", {
      companyId: query.companyId,
      agentId: query.agentId,
    });

    const result = await this.agentService.getAgent(query.agentId);
    if (!result.ok) {
      return result as Result<AgentResponseDto>;
    }

    const agent = result.value;

    return {
      ok: true,
      value: {
        id: agent.id,
        companyId: agent.companyId,
        name: agent.name,
        role: agent.role,
        title: agent.title,
        icon: agent.icon,
        status: agent.status,
        isActive: agent.isActive(),
        isHealthy: agent.isHealthy(),
        lastHeartbeatAt: agent.lastHeartbeatAt,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        urlKey: agent.urlKey,
      },
    };
  }

  /**
   * List agents (ListAgentsQuery)
   */
  async listAgents(query: ListAgentsQuery): Promise<Result<PaginatedAgentsResponseDto>> {
    logger.debug("Application: Listing agents", { query });

    const result = await this.agentService.listAgentsByCompany(query.companyId);
    if (!result.ok) {
      return result as Result<PaginatedAgentsResponseDto>;
    }

    const agents = result.value;
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 20;

    const items = agents.slice(offset, offset + limit).map((agent) => ({
      id: agent.id,
      companyId: agent.companyId,
      name: agent.name,
      role: agent.role,
      title: agent.title,
      icon: agent.icon,
      status: agent.status,
      isActive: agent.isActive(),
      isHealthy: agent.isHealthy(),
      lastHeartbeatAt: agent.lastHeartbeatAt,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      urlKey: agent.urlKey,
    }));

    return {
      ok: true,
      value: {
        total: agents.length,
        count: items.length,
        offset,
        hasMore: offset + limit < agents.length,
        nextOffset: offset + limit < agents.length ? offset + limit : undefined,
        items,
      },
    };
  }

  /**
   * Check agent health (CheckAgentHealthQuery)
   */
  async checkAgentHealth(query: CheckAgentHealthQuery): Promise<Result<AgentHealthResponseDto>> {
    logger.debug("Application: Checking agent health", {
      companyId: query.companyId,
      agentId: query.agentId,
    });

    const result = await this.agentService.getAgent(query.agentId);
    if (!result.ok) {
      return result as Result<AgentHealthResponseDto>;
    }

    const agent = result.value;

    return {
      ok: true,
      value: {
        agentId: agent.id,
        name: agent.name,
        status: agent.status,
        isHealthy: agent.isHealthy(),
        lastHeartbeatAt: agent.lastHeartbeatAt,
      },
    };
  }
}
