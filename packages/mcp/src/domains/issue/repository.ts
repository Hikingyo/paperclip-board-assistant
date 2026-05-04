import type { Result } from "../../shared/api/errors.js";
import type { Issue } from "./entity.js";

export interface IssueRepository {
  findById(companyId: string, issueId: string): Promise<Result<Issue>>;
  findByCompanyId(companyId: string): Promise<Result<Issue[]>>;
  findByProjectId(companyId: string, projectId: string): Promise<Result<Issue[]>>;
}
