import type { Result } from "../../shared/api/errors.js";
import type { Agent } from "./entity.js";

/**
 * Agent Repository Interface
 */
export interface AgentRepository {
  findById(id: string): Promise<Result<Agent>>;
  findAll(): Promise<Result<Agent[]>>;
  findByCompanyId(companyId: string): Promise<Result<Agent[]>>;
}
