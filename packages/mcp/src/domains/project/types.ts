import type { PaperclipProject } from "../../types.js";

export interface ProjectSnapshot {
  id: string;
  companyId: string;
  name: string;
  status: string;
  leadAgentId: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  raw: PaperclipProject;
}
