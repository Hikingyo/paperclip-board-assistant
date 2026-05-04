import type { PaperclipProject } from "../../types.js";
import { Project } from "./entity.js";
import type { ProjectSnapshot } from "./types.js";

export function toProjectDomain(api: PaperclipProject): Project {
  const snapshot: ProjectSnapshot = {
    id: api.id,
    companyId: api.companyId,
    name: api.name,
    status: api.status,
    leadAgentId: api.leadAgentId,
    targetDate: api.targetDate,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    raw: api,
  };
  return Project.fromSnapshot(snapshot);
}

export function toProjectDomainList(apis: PaperclipProject[]): Project[] {
  return apis.map((api) => toProjectDomain(api));
}
