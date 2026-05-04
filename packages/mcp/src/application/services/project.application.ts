import type { ProjectService } from "../../domains/project/service.js";
import type { Result } from "../../shared/api/errors.js";
import type { PaperclipProject } from "../../types.js";

export class ProjectApplicationService {
  constructor(private readonly projectService: ProjectService) {}

  async listProjects(companyId: string): Promise<Result<PaperclipProject[]>> {
    const result = await this.projectService.listProjects(companyId);
    if (!result.ok) {
      return result as Result<PaperclipProject[]>;
    }
    return { ok: true, value: result.value.map((project) => project.toSnapshot().raw) };
  }

  async getProject(companyId: string, projectId: string): Promise<Result<PaperclipProject>> {
    const result = await this.projectService.getProject(companyId, projectId);
    if (!result.ok) {
      return result as Result<PaperclipProject>;
    }
    return { ok: true, value: result.value.toSnapshot().raw };
  }
}
