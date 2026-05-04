import { describe, expect, it } from "vitest";

import { PaperclipAgentRepository } from "../src/infrastructure/repositories/agent-repository.js";
import { PaperclipCompanyRepository } from "../src/infrastructure/repositories/company-repository.js";
import { PaperclipIssueRepository } from "../src/infrastructure/repositories/issue-repository.js";
import { PaperclipProjectRepository } from "../src/infrastructure/repositories/project-repository.js";
import { PaperclipRoutineRepository } from "../src/infrastructure/repositories/routine-repository.js";
import { API_ERROR_CODES, PaperclipApiError } from "../src/shared/api/errors.js";
import type {
  PaperclipAgent,
  PaperclipCompany,
  PaperclipIssue,
  PaperclipProject,
} from "../src/types.js";

describe("infrastructure repositories", () => {
  it("maps successful company responses to domain entities", async () => {
    const api = {
      get: async () =>
        ({
          ok: true,
          value: {
            id: "c1",
            name: "Acme",
            description: null,
            status: "active",
            issuePrefix: "ACM",
            issueCounter: 1,
            budgetMonthlyCents: 100,
            spentMonthlyCents: 50,
            attachmentMaxBytes: 0,
            requireBoardApprovalForNewAgents: false,
            feedbackDataSharingEnabled: false,
            feedbackDataSharingConsentAt: null,
            feedbackDataSharingConsentByUserId: null,
            feedbackDataSharingTermsVersion: null,
            brandColor: null,
            logoAssetId: null,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-02",
            logoUrl: null,
          } satisfies PaperclipCompany,
        }) as const,
    };
    const repo = new PaperclipCompanyRepository(api as never);
    const result = await repo.findById("c1");
    expect(result.ok && result.value.id).toBe("c1");
  });

  it("propagates failures from API client", async () => {
    const error = new PaperclipApiError("boom", API_ERROR_CODES.SERVER_ERROR, 500);
    const api = { get: async () => ({ ok: false, error }) };
    const repo = new PaperclipAgentRepository(api as never, "c1");
    const result = await repo.findAll();
    expect(result.ok).toBe(false);
  });

  it("maps agent/project/issue collections", async () => {
    const api = {
      get: async (path: string) => {
        if (path.includes("/agents")) {
          return {
            ok: true as const,
            value: [
              {
                id: "a1",
                companyId: "c1",
                name: "Agent",
                role: "engineer",
                title: null,
                icon: null,
                status: "active",
                reportsTo: null,
                capabilities: null,
                adapterType: "local",
                adapterConfig: {},
                runtimeConfig: {},
                defaultEnvironmentId: null,
                budgetMonthlyCents: 0,
                spentMonthlyCents: 0,
                pauseReason: null,
                pausedAt: null,
                permissions: { canCreateAgents: false },
                lastHeartbeatAt: null,
                metadata: null,
                createdAt: "2026-01-01",
                updatedAt: "2026-01-02",
                urlKey: "agent",
              } satisfies PaperclipAgent,
            ],
          };
        }
        if (path.includes("/projects")) {
          return {
            ok: true as const,
            value: [
              {
                id: "p1",
                companyId: "c1",
                goalId: null,
                name: "Project",
                description: null,
                status: "in_progress",
                leadAgentId: null,
                targetDate: null,
                color: "#000",
                env: null,
                pauseReason: null,
                pausedAt: null,
                executionWorkspacePolicy: null,
                archivedAt: null,
                createdAt: "2026-01-01",
                updatedAt: "2026-01-02",
                urlKey: "project",
                goalIds: [],
                goals: [],
                codebase: {
                  workspaceId: "",
                  repoUrl: "",
                  repoRef: null,
                  defaultRef: null,
                  repoName: "",
                  localFolder: "",
                  managedFolder: "",
                  effectiveLocalFolder: "",
                  origin: "",
                },
                workspaces: [],
                primaryWorkspace: {
                  id: "",
                  companyId: "c1",
                  projectId: "p1",
                  name: "",
                  sourceType: "",
                  cwd: "",
                  repoUrl: null,
                  repoRef: null,
                  defaultRef: null,
                  visibility: "",
                  setupCommand: null,
                  cleanupCommand: null,
                  remoteProvider: null,
                  remoteWorkspaceRef: null,
                  sharedWorkspaceKey: null,
                  metadata: null,
                  runtimeConfig: null,
                  isPrimary: true,
                  runtimeServices: [],
                  createdAt: "2026-01-01",
                  updatedAt: "2026-01-02",
                },
              } satisfies PaperclipProject,
            ],
          };
        }
        return {
          ok: true as const,
          value: [
            {
              id: "i1",
              companyId: "c1",
              projectId: "p1",
              projectWorkspaceId: null,
              goalId: null,
              parentId: null,
              title: "Issue",
              description: null,
              status: "open",
              priority: "low",
              assigneeAgentId: null,
              assigneeUserId: null,
              createdByAgentId: null,
              createdByUserId: null,
              issueNumber: 1,
              identifier: "ACM-1",
              originKind: "manual",
              originId: null,
              requestDepth: 0,
              billingCode: null,
              executionPolicy: null,
              startedAt: null,
              completedAt: null,
              cancelledAt: null,
              hiddenAt: null,
              createdAt: "2026-01-01",
              updatedAt: "2026-01-02",
              labels: [],
              labelIds: [],
              lastActivityAt: null,
              blockerAttention: {
                state: "ok",
                reason: null,
                unresolvedBlockerCount: 0,
                coveredBlockerCount: 0,
                stalledBlockerCount: 0,
                attentionBlockerCount: 0,
                sampleBlockerIdentifier: null,
                sampleStalledBlockerIdentifier: null,
              },
            } satisfies PaperclipIssue,
          ],
        };
      },
    };

    const agentRepo = new PaperclipAgentRepository(api as never, "c1");
    const projectRepo = new PaperclipProjectRepository(api as never);
    const issueRepo = new PaperclipIssueRepository(api as never);
    const routineRepo = new PaperclipRoutineRepository(api as never);

    const agents = await agentRepo.findByCompanyId("c1");
    const projects = await projectRepo.findByCompanyId("c1");
    const issues = await issueRepo.findByCompanyId("c1");

    expect(agents.ok && agents.value.length).toBe(1);
    expect(projects.ok && projects.value.length).toBe(1);
    expect(issues.ok && issues.value.length).toBe(1);

    const routines = await routineRepo.findAllByCompanyId("c1");
    expect(routines.ok && routines.value.length).toBe(0);
  });
});
