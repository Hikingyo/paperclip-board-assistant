import type { PaperclipAgent } from "../../types.js";
import { Agent } from "./entity.js";
import type { AgentSnapshot } from "./types.js";

/**
 * Agent Mapper
 */
export class AgentMapper {
  static toDomain(api: PaperclipAgent): Agent {
    const snapshot: AgentSnapshot = {
      id: api.id,
      companyId: api.companyId,
      name: api.name,
      role: api.role,
      title: api.title,
      icon: api.icon,
      status: api.status,
      reportsTo: api.reportsTo,
      capabilities: api.capabilities,
      adapterType: api.adapterType,
      budgetMonthlyCents: api.budgetMonthlyCents,
      spentMonthlyCents: api.spentMonthlyCents,
      pauseReason: api.pauseReason,
      pausedAt: api.pausedAt,
      lastHeartbeatAt: api.lastHeartbeatAt,
      createdAt: api.createdAt,
      updatedAt: api.updatedAt,
      urlKey: api.urlKey,
    };
    return Agent.fromSnapshot(snapshot);
  }

  static toDomainList(apis: PaperclipAgent[]): Agent[] {
    return apis.map((api) => AgentMapper.toDomain(api));
  }

  static toPersistence(domain: Agent): PaperclipAgent {
    return {
      id: domain.id,
      companyId: domain.companyId,
      name: domain.name,
      role: domain.role,
      title: domain.title,
      icon: domain.icon,
      status: domain.status,
      reportsTo: domain.reportsTo,
      capabilities: domain.capabilities,
      adapterType: domain.adapterType,
      budgetMonthlyCents: domain.budgetMonthlyCents,
      spentMonthlyCents: domain.spentMonthlyCents,
      pauseReason: domain.pauseReason,
      pausedAt: domain.pausedAt,
      lastHeartbeatAt: domain.lastHeartbeatAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      urlKey: domain.urlKey,
      permissions: { canCreateAgents: false },
      metadata: null,
      defaultEnvironmentId: null,
      adapterConfig: {},
      runtimeConfig: {},
    };
  }
}
