import type { AgentRole, AgentSnapshot, AgentStatus } from "./types.js";

/**
 * Agent Aggregate Root
 */
export class Agent {
  private constructor(
    readonly id: string,
    readonly companyId: string,
    readonly name: string,
    readonly role: AgentRole,
    readonly title: string | null,
    readonly icon: string | null,
    readonly status: AgentStatus,
    readonly reportsTo: string | null,
    readonly capabilities: string | null,
    readonly adapterType: string,
    readonly budgetMonthlyCents: number,
    readonly spentMonthlyCents: number,
    readonly pauseReason: string | null,
    readonly pausedAt: string | null,
    readonly lastHeartbeatAt: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
    readonly urlKey: string,
  ) {}

  static fromSnapshot(snapshot: AgentSnapshot): Agent {
    return new Agent(
      snapshot.id,
      snapshot.companyId,
      snapshot.name,
      snapshot.role,
      snapshot.title,
      snapshot.icon,
      snapshot.status,
      snapshot.reportsTo,
      snapshot.capabilities,
      snapshot.adapterType,
      snapshot.budgetMonthlyCents,
      snapshot.spentMonthlyCents,
      snapshot.pauseReason,
      snapshot.pausedAt,
      snapshot.lastHeartbeatAt,
      snapshot.createdAt,
      snapshot.updatedAt,
      snapshot.urlKey,
    );
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isHealthy(): boolean {
    return this.status !== "paused";
  }

  getSummary(): string {
    return `${this.name} (${this.role}, ${this.status}) at ${this.updatedAt}`;
  }

  toSnapshot(): AgentSnapshot {
    return {
      id: this.id,
      companyId: this.companyId,
      name: this.name,
      role: this.role,
      title: this.title,
      icon: this.icon,
      status: this.status,
      reportsTo: this.reportsTo,
      capabilities: this.capabilities,
      adapterType: this.adapterType,
      budgetMonthlyCents: this.budgetMonthlyCents,
      spentMonthlyCents: this.spentMonthlyCents,
      pauseReason: this.pauseReason,
      pausedAt: this.pausedAt,
      lastHeartbeatAt: this.lastHeartbeatAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      urlKey: this.urlKey,
    };
  }
}
