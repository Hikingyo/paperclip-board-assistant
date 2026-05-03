/**
 * Company Domain Types
 * Value objects and types for the Company aggregate
 */

export interface CompanyId {
  readonly id: string;
}

export interface CompanyMember {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar?: string;
  readonly role: "admin" | "member" | "viewer";
}

export interface Workflow {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
  readonly tasks: unknown[];
}

export interface BlockerAttention {
  readonly state: "healthy" | "warning" | "critical";
  readonly reason: string | null;
  readonly unresolvedBlockerCount: number;
  readonly coveredBlockerCount: number;
  readonly stalledBlockerCount: number;
  readonly attentionBlockerCount: number;
  readonly sampleBlockerIdentifier: string | null;
  readonly sampleStalledBlockerIdentifier: string | null;
}

export interface CompanySnapshot {
  id: string;
  name: string;
  description: string | null;
  status: string;
  issuePrefix: string;
  issueCounter: number;
  budgetMonthlyCents: number;
  spentMonthlyCents: number;
  brandColor: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
