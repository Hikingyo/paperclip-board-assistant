import type { Result } from "../../shared/api/errors.js";
import type { Project } from "./entity.js";
import type { ProjectRepository } from "./repository.js";

export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  getProject(companyId: string, projectId: string): Promise<Result<Project>> {
    return this.projectRepository.findById(companyId, projectId);
  }

  listProjects(companyId: string): Promise<Result<Project[]>> {
    return this.projectRepository.findByCompanyId(companyId);
  }
}
