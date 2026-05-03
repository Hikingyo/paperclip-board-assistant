import type { CompanySnapshot } from "./types.js";

/**
 * Company Aggregate Root
 * Encapsulates all company state and business rules
 */
export class Company {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string | null,
    readonly status: string,
    readonly issuePrefix: string,
    readonly issueCounter: number,
    readonly budgetMonthlyCents: number,
    readonly spentMonthlyCents: number,
    readonly brandColor: string | null,
    readonly logoUrl: string | null,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  /**
   * Create a Company from API data
   */
  static fromSnapshot(snapshot: CompanySnapshot): Company {
    return new Company(
      snapshot.id,
      snapshot.name,
      snapshot.description,
      snapshot.status,
      snapshot.issuePrefix,
      snapshot.issueCounter,
      snapshot.budgetMonthlyCents,
      snapshot.spentMonthlyCents,
      snapshot.brandColor,
      snapshot.logoUrl,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  /**
   * Get company summary for display
   */
  getSummary(): string {
    return `${this.name} (${this.status}, budget: $${(this.budgetMonthlyCents / 100).toFixed(2)})`;
  }

  /**
   * Check if company is over budget
   */
  isOverBudget(): boolean {
    return this.spentMonthlyCents > this.budgetMonthlyCents;
  }

  /**
   * Get budget utilization percentage
   */
  getBudgetUtilization(): number {
    if (this.budgetMonthlyCents === 0) return 0;
    return (this.spentMonthlyCents / this.budgetMonthlyCents) * 100;
  }

  /**
   * Get snapshot for persistence
   */
  toSnapshot(): CompanySnapshot {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      issuePrefix: this.issuePrefix,
      issueCounter: this.issueCounter,
      budgetMonthlyCents: this.budgetMonthlyCents,
      spentMonthlyCents: this.spentMonthlyCents,
      brandColor: this.brandColor,
      logoUrl: this.logoUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
