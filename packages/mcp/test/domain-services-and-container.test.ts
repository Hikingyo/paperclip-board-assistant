import { describe, expect, it } from "vitest";

import { Agent } from "../src/domains/agent/entity.js";
import { AgentService } from "../src/domains/agent/service.js";
import { Company } from "../src/domains/company/entity.js";
import { CompanyService } from "../src/domains/company/service.js";
import { Issue } from "../src/domains/issue/entity.js";
import { IssueService } from "../src/domains/issue/service.js";
import { Project } from "../src/domains/project/entity.js";
import { ProjectService } from "../src/domains/project/service.js";
import { Routine } from "../src/domains/routine/entity.js";
import { RoutineService } from "../src/domains/routine/service.js";
import { ServiceContainer } from "../src/shared/container.js";

describe("domain services and container", () => {
  it("validates company id and computes health", async () => {
    const company = Company.fromSnapshot({
      id: "c1",
      name: "Acme",
      description: null,
      status: "active",
      issuePrefix: "ACM",
      issueCounter: 1,
      budgetMonthlyCents: 100,
      spentMonthlyCents: 150,
      brandColor: null,
      logoUrl: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const service = new CompanyService({
      findById: async () => ({ ok: true, value: company }),
      findAll: async () => ({ ok: true, value: [company] }),
      findByIdWithDetails: async () => ({ ok: true, value: company }),
    } as never);

    const invalid = await service.getCompany("");
    expect(invalid.ok).toBe(false);
    const health = await service.checkCompanyHealth("c1");
    expect(health.ok && health.value).toBe(true);
  });

  it("delegates agent/project/issue/routine read operations", async () => {
    const agent = Agent.fromSnapshot({
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
      budgetMonthlyCents: 0,
      spentMonthlyCents: 0,
      pauseReason: null,
      pausedAt: null,
      lastHeartbeatAt: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
      urlKey: "agent",
    });
    const project = Project.fromSnapshot({
      id: "p1",
      companyId: "c1",
      name: "Project",
      status: "in_progress",
      leadAgentId: null,
      targetDate: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
      raw: {} as never,
    });
    const issue = Issue.fromSnapshot({
      id: "i1",
      companyId: "c1",
      projectId: "p1",
      parentId: null,
      title: "Issue",
      status: "open",
      priority: "low",
      assigneeAgentId: null,
      assigneeUserId: null,
      createdByAgentId: null,
      createdAt: "2026-01-01",
      completedAt: null,
      blockerUnresolvedCount: 1,
      raw: {} as never,
    });

    const agentService = new AgentService({
      findById: async () => ({ ok: true, value: agent }),
      findAll: async () => ({ ok: true, value: [agent] }),
      findByCompanyId: async () => ({ ok: true, value: [agent] }),
    } as never);
    const projectService = new ProjectService({
      findById: async () => ({ ok: true, value: project }),
      findByCompanyId: async () => ({ ok: true, value: [project] }),
    } as never);
    const issueService = new IssueService({
      findById: async () => ({ ok: true, value: issue }),
      findByCompanyId: async () => ({ ok: true, value: [issue] }),
      findByProjectId: async () => ({ ok: true, value: [issue] }),
    } as never);
    const routine = Routine.fromSnapshot({
      id: "routine-i1",
      companyId: "c1",
      name: "Routine",
      raw: { id: "routine-i1", name: "Routine" },
    });
    const routineService = new RoutineService({
      findAllByCompanyId: async () => ({ ok: true, value: [routine] }),
      findById: async () => ({ ok: true, value: routine }),
      findRunsByRoutineId: async () => ({ ok: true, value: [] }),
      findRunById: async () => ({ ok: true, value: {} as never }),
      findFailedRuns: async () => ({ ok: true, value: [] }),
      findSchedule: async () => ({ ok: true, value: {} as never }),
    } as never);

    const health = await agentService.checkAgentHealth("a1");
    const projects = await projectService.listProjects("c1");
    const issues = await issueService.listIssuesByProject("c1", "p1");
    const routines = await routineService.listRoutines("c1");
    expect(health.ok && health.value).toBe(true);
    expect(projects.ok && projects.value.length).toBe(1);
    expect(issues.ok && issues.value[0]?.isBlocked()).toBe(true);
    expect(routines.ok && routines.value.length).toBe(1);
  });

  it("wires all services in container", () => {
    const apiClient = { get: async () => ({ ok: true, value: [] }) };
    const container = new ServiceContainer(apiClient as never);
    expect(container.getApiClient()).toBe(apiClient);
    expect(container.getCompanyApplicationService()).toBeDefined();
    expect(container.getAgentApplicationService()).toBeDefined();
    expect(container.getProjectApplicationService()).toBeDefined();
    expect(container.getIssueApplicationService()).toBeDefined();
    expect(container.getRoutineApplicationService()).toBeDefined();
    expect(container.getCompanyService()).toBeDefined();
    expect(container.getAgentService()).toBeDefined();
  });
});
