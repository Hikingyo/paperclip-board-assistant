/**
 * Agent Application DTOs
 */

export interface GetAgentQuery {
  companyId: string;
  agentId: string;
}

export interface AgentResponseDto {
  id: string;
  companyId: string;
  name: string;
  role: string;
  title: string | null;
  icon: string | null;
  status: string;
  isActive: boolean;
  isHealthy: boolean;
  lastHeartbeatAt: string | null;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
}

export interface ListAgentsQuery {
  companyId: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedAgentsResponseDto {
  total: number;
  count: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | undefined;
  items: AgentResponseDto[];
}

export interface CheckAgentHealthQuery {
  companyId: string;
  agentId: string;
}

export interface AgentHealthResponseDto {
  agentId: string;
  name: string;
  status: string;
  isHealthy: boolean;
  lastHeartbeatAt: string | null;
}
