import type { Result } from "../../shared/api/errors.js";
import type { Issue } from "./entity.js";
import type { IssueRepository } from "./repository.js";

export class IssueService {
  constructor(private readonly issueRepository: IssueRepository) {}

  getIssue(companyId: string, issueId: string): Promise<Result<Issue>> {
    return this.issueRepository.findById(companyId, issueId);
  }

  listIssues(companyId: string): Promise<Result<Issue[]>> {
    return this.issueRepository.findByCompanyId(companyId);
  }

  listIssuesByProject(companyId: string, projectId: string): Promise<Result<Issue[]>> {
    return this.issueRepository.findByProjectId(companyId, projectId);
  }
}
