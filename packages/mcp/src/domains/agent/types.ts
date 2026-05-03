/**
 * Agent Domain Types
 * Value objects and types for the Agent aggregate
 */

export type AgentRole =
  | "ceo"
  | "cto"
  | "cmo"
  | "cfo"
  | "security"
  | "engineer"
  | "designer"
  | "pm"
  | "qa"
  | "devops"
  | "researcher"
  | "general";

export type AgentStatus = "active" | "idle" | "paused" | "pending_approval";

export interface AgentSnapshot {
  id: string;
  companyId: string;
  name: string;
  role: AgentRole;
  title: string | null;
  icon: string | null;
  status: AgentStatus;
  reportsTo: string | null;
  capabilities: string | null;
  adapterType: string;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  pauseReason: string | null;
  pausedAt: string | null;
  lastHeartbeatAt: string | null;
  createdAt: string;
  updatedAt: string;
  urlKey: string;
}
