import type { PaperclipIssue } from "../../types.js";
import { Issue } from "./entity.js";
import type { IssueSnapshot } from "./types.js";

export function toIssueDomain(api: PaperclipIssue): Issue {
  const snapshot: IssueSnapshot = {
    id: api.id,
    companyId: api.companyId,
    projectId: api.projectId,
    parentId: api.parentId,
    title: api.title,
    status: api.status,
    priority: api.priority,
    assigneeAgentId: api.assigneeAgentId,
    assigneeUserId: api.assigneeUserId,
    createdByAgentId: api.createdByAgentId,
    createdAt: api.createdAt,
    completedAt: api.completedAt,
    blockerUnresolvedCount: api.blockerAttention.unresolvedBlockerCount,
    raw: api,
  };
  return Issue.fromSnapshot(snapshot);
}

export function toIssueDomainList(apis: PaperclipIssue[]): Issue[] {
  return apis.map((api) => toIssueDomain(api));
}
