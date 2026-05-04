import type { Result } from "../../shared/api/errors.js";
import type { Project } from "./entity.js";

export interface ProjectRepository {
  findById(companyId: string, projectId: string): Promise<Result<Project>>;
  findByCompanyId(companyId: string): Promise<Result<Project[]>>;
}
