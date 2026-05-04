import type { Project } from "../../domains/project/entity.js";
import { toProjectDomain, toProjectDomainList } from "../../domains/project/mapper.js";
import type { ProjectRepository } from "../../domains/project/repository.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import type { Result } from "../../shared/api/errors.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { PaperclipProject } from "../../types.js";

export class PaperclipProjectRepository implements ProjectRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findById(companyId: string, projectId: string): Promise<Result<Project>> {
    const result = await this.client.get<PaperclipProject>(ApiPaths.project(companyId, projectId));
    if (!result.ok) {
      return result as Result<Project>;
    }
    return { ok: true, value: toProjectDomain(result.value) };
  }

  async findByCompanyId(companyId: string): Promise<Result<Project[]>> {
    const result = await this.client.get<PaperclipProject[]>(ApiPaths.projects(companyId));
    if (!result.ok) {
      return result as Result<Project[]>;
    }
    return { ok: true, value: toProjectDomainList(result.value) };
  }
}
