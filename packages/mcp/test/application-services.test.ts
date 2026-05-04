import { describe, expect, it } from "vitest";

import { AgentApplicationService } from "../src/application/services/agent.application.js";
import { CompanyApplicationService } from "../src/application/services/company.application.js";
import { IssueApplicationService } from "../src/application/services/issue.application.js";
import { ProjectApplicationService } from "../src/application/services/project.application.js";
import { RoutineApplicationService } from "../src/application/services/routine.application.js";
import { Agent } from "../src/domains/agent/entity.js";
import { Company } from "../src/domains/company/entity.js";
import { Issue } from "../src/domains/issue/entity.js";
import { Project } from "../src/domains/project/entity.js";
import { Routine } from "../src/domains/routine/entity.js";
import { API_ERROR_CODES, PaperclipApiError } from "../src/shared/api/errors.js";
import type { PaperclipIssue, PaperclipProject } from "../src/types.js";

describe("application services", () => {
  it("maps company domain entity to dto", async () => {
    const company = Company.fromSnapshot({
      id: "c1",
      name: "Acme",
      description: null,
      status: "active",
      issuePrefix: "ACM",
      issueCounter: 4,
      budgetMonthlyCents: 100_00,
      spentMonthlyCents: 25_00,
      brandColor: null,
      logoUrl: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const service = new CompanyApplicationService({
      getCompany: async () => ({ ok: true, value: company }),
      listCompanies: async () => ({ ok: true, value: [company] }),
    } as never);

    const single = await service.getCompany({ id: "c1" });
    expect(single.ok && single.value.budgetUtilization).toBe(25);

    const list = await service.listCompanies({ limit: 20, offset: 0 });
    expect(list.ok && list.value.total).toBe(1);
  });

  it("maps agent domain entity to dto", async () => {
    const agent = Agent.fromSnapshot({
      id: "a1",
      companyId: "c1",
      name: "Agent One",
      role: "engineer",
      title: null,
      icon: null,
      status: "active",
      reportsTo: null,
      capabilities: null,
      adapterType: "local",
      budgetMonthlyCents: 0,
      spentMonthlyCents: 0,
      pauseReason: null,
      pausedAt: null,
      lastHeartbeatAt: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
      urlKey: "agent-one",
    });
    const service = new AgentApplicationService({
      getAgent: async () => ({ ok: true, value: agent }),
      listAgentsByCompany: async () => ({ ok: true, value: [agent] }),
    } as never);

    const single = await service.getAgent({ companyId: "c1", agentId: "a1" });
    expect(single.ok && single.value.isActive).toBe(true);

    const list = await service.listAgents({ companyId: "c1", limit: 20, offset: 0 });
    expect(list.ok && list.value.count).toBe(1);
  });

  it("returns mapped raw project and issue payloads", async () => {
    const rawProject: PaperclipProject = {
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
    };
    const rawIssue: PaperclipIssue = {
      id: "i1",
      companyId: "c1",
      projectId: "p1",
      projectWorkspaceId: null,
      goalId: null,
      parentId: null,
      title: "Issue",
      description: null,
      status: "open",
      priority: "medium",
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
    };

    const projectService = new ProjectApplicationService({
      listProjects: async () =>
        ({
          ok: true,
          value: [
            Project.fromSnapshot({
              id: "p1",
              companyId: "c1",
              name: "Project",
              status: "in_progress",
              leadAgentId: null,
              targetDate: null,
              createdAt: "2026-01-01",
              updatedAt: "2026-01-02",
              raw: rawProject,
            }),
          ],
        }) as const,
      getProject: async () =>
        ({
          ok: true,
          value: Project.fromSnapshot({
            id: "p1",
            companyId: "c1",
            name: "Project",
            status: "in_progress",
            leadAgentId: null,
            targetDate: null,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-02",
            raw: rawProject,
          }),
        }) as const,
    } as never);
    const issueService = new IssueApplicationService({
      listIssues: async () =>
        ({
          ok: true,
          value: [
            Issue.fromSnapshot({
              id: "i1",
              companyId: "c1",
              projectId: "p1",
              parentId: null,
              title: "Issue",
              status: "open",
              priority: "medium",
              assigneeAgentId: null,
              assigneeUserId: null,
              createdByAgentId: null,
              createdAt: "2026-01-01",
              completedAt: null,
              blockerUnresolvedCount: 0,
              raw: rawIssue,
            }),
          ],
        }) as const,
      listIssuesByProject: async () =>
        ({
          ok: true,
          value: [
            Issue.fromSnapshot({
              id: "i1",
              companyId: "c1",
              projectId: "p1",
              parentId: null,
              title: "Issue",
              status: "open",
              priority: "medium",
              assigneeAgentId: null,
              assigneeUserId: null,
              createdByAgentId: null,
              createdAt: "2026-01-01",
              completedAt: null,
              blockerUnresolvedCount: 0,
              raw: rawIssue,
            }),
          ],
        }) as const,
      getIssue: async () =>
        ({
          ok: true,
          value: Issue.fromSnapshot({
            id: "i1",
            companyId: "c1",
            projectId: "p1",
            parentId: null,
            title: "Issue",
            status: "open",
            priority: "medium",
            assigneeAgentId: null,
            assigneeUserId: null,
            createdByAgentId: null,
            createdAt: "2026-01-01",
            completedAt: null,
            blockerUnresolvedCount: 0,
            raw: rawIssue,
          }),
        }) as const,
    } as never);

    const projects = await projectService.listProjects("c1");
    const issues = await issueService.listIssues("c1");
    expect(projects.ok && projects.value[0]?.id).toBe("p1");
    expect(issues.ok && issues.value[0]?.id).toBe("i1");
  });

  it("returns mapped routine payloads", async () => {
    const routineService = new RoutineApplicationService({
      listRoutines: async () =>
        ({
          ok: true,
          value: [
            Routine.fromSnapshot({
              id: "routine-i1",
              companyId: "c1",
              name: "Routine",
              raw: { id: "routine-i1", name: "Routine" },
            }),
          ],
        }) as const,
      getRoutine: async () =>
        ({
          ok: true,
          value: Routine.fromSnapshot({
            id: "routine-i1",
            companyId: "c1",
            name: "Routine",
            raw: { id: "routine-i1", name: "Routine" },
          }),
        }) as const,
      listRoutineRuns: async () =>
        ({
          ok: true,
          value: [],
        }) as const,
      getRoutineRun: async () =>
        ({
          ok: true,
          value: {
            toSnapshot: () => ({ raw: { id: "run-1", status: "done", createdAt: "2026-01-01" } }),
          },
        }) as const,
      listFailedRoutineRuns: async () =>
        ({
          ok: true,
          value: [],
        }) as const,
      getRoutineSchedule: async () =>
        ({
          ok: true,
          value: { toSnapshot: () => ({ raw: { nextRunAt: "2026-01-02", frequency: "daily" } }) },
        }) as const,
    } as never);
    const routines = await routineService.listRoutines("c1");
    expect(routines.ok && routines.value[0]?.id).toBe("routine-i1");
  });

  it("propagates failures", async () => {
    const error = new PaperclipApiError("boom", API_ERROR_CODES.SERVER_ERROR, 500);
    const companyService = new CompanyApplicationService({
      getCompany: async () => ({ ok: false, error }),
      listCompanies: async () => ({ ok: false, error }),
    } as never);
    const result = await companyService.getCompany({ id: "c1" });
    expect(result.ok).toBe(false);
  });
});
