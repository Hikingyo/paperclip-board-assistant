import type { Issue } from "../../domains/issue/entity.js";
import { toIssueDomain, toIssueDomainList } from "../../domains/issue/mapper.js";
import type { IssueRepository } from "../../domains/issue/repository.js";
import type { PaperclipApiClient } from "../../shared/api/client.js";
import type { Result } from "../../shared/api/errors.js";
import { ApiPaths } from "../../shared/api/paths.js";
import type { PaperclipIssue } from "../../types.js";

export class PaperclipIssueRepository implements IssueRepository {
  constructor(private readonly client: PaperclipApiClient) {}

  async findById(companyId: string, issueId: string): Promise<Result<Issue>> {
    const result = await this.client.get<PaperclipIssue>(ApiPaths.issue(companyId, issueId));
    if (!result.ok) {
      return result as Result<Issue>;
    }
    return { ok: true, value: toIssueDomain(result.value) };
  }

  async findByCompanyId(companyId: string): Promise<Result<Issue[]>> {
    const result = await this.client.get<PaperclipIssue[]>(ApiPaths.issues(companyId));
    if (!result.ok) {
      return result as Result<Issue[]>;
    }
    return { ok: true, value: toIssueDomainList(result.value) };
  }

  async findByProjectId(companyId: string, projectId: string): Promise<Result<Issue[]>> {
    const result = await this.client.get<PaperclipIssue[]>(
      ApiPaths.issues(companyId, { projectId }),
    );
    if (!result.ok) {
      return result as Result<Issue[]>;
    }
    return { ok: true, value: toIssueDomainList(result.value) };
  }
}
