import type { IssueService } from "../../domains/issue/service.js";
import type { Result } from "../../shared/api/errors.js";
import type { PaperclipIssue } from "../../types.js";

export class IssueApplicationService {
  constructor(private readonly issueService: IssueService) {}

  async listIssues(companyId: string): Promise<Result<PaperclipIssue[]>> {
    const result = await this.issueService.listIssues(companyId);
    if (!result.ok) {
      return result as Result<PaperclipIssue[]>;
    }
    return { ok: true, value: result.value.map((issue) => issue.toSnapshot().raw) };
  }

  async listIssuesByProject(
    companyId: string,
    projectId: string,
  ): Promise<Result<PaperclipIssue[]>> {
    const result = await this.issueService.listIssuesByProject(companyId, projectId);
    if (!result.ok) {
      return result as Result<PaperclipIssue[]>;
    }
    return { ok: true, value: result.value.map((issue) => issue.toSnapshot().raw) };
  }

  async getIssue(companyId: string, issueId: string): Promise<Result<PaperclipIssue>> {
    const result = await this.issueService.getIssue(companyId, issueId);
    if (!result.ok) {
      return result as Result<PaperclipIssue>;
    }
    return { ok: true, value: result.value.toSnapshot().raw };
  }
}
