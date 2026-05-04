import type { PaperclipIssue } from "../../types.js";

export interface IssueSnapshot {
  id: string;
  companyId: string;
  projectId: string | null;
  parentId: string | null;
  title: string;
  status: string;
  priority: string;
  assigneeAgentId: string | null;
  assigneeUserId: string | null;
  createdByAgentId: string | null;
  createdAt: string;
  completedAt: string | null;
  blockerUnresolvedCount: number;
  raw: PaperclipIssue;
}
