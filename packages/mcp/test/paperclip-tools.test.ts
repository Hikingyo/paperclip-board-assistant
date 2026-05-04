import { describe, expect, it } from "vitest";

import { registerPaperclipTools } from "../src/tools/paperclip-tools.js";

type ToolHandler = (input: Record<string, unknown>) => Promise<{
  content?: Array<{ type: string; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}>;

class FakeServer {
  handlers = new Map<string, ToolHandler>();

  registerTool(name: string, _meta: unknown, handler: ToolHandler): void {
    this.handlers.set(name, handler);
  }
}

describe("paperclip tools registration", () => {
  it("registers and executes core and domain read tools", async () => {
    const company = {
      id: "c1",
      name: "Acme",
      description: null,
      status: "active",
      issuePrefix: "ACM",
      issueCounter: 1,
      budgetMonthlyCents: 100_000,
      spentMonthlyCents: 10_000,
      attachmentMaxBytes: 1024,
      requireBoardApprovalForNewAgents: false,
      feedbackDataSharingEnabled: false,
      feedbackDataSharingConsentAt: null,
      feedbackDataSharingConsentByUserId: null,
      feedbackDataSharingTermsVersion: null,
      brandColor: null,
      logoAssetId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      logoUrl: null,
    };
    const project = {
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
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
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
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    };
    const issue = {
      id: "i1",
      companyId: "c1",
      projectId: "p1",
      projectWorkspaceId: null,
      goalId: null,
      parentId: null,
      title: "routine APPROVAL",
      description: null,
      status: "in_review",
      priority: "high",
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
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      labels: [],
      labelIds: [],
      lastActivityAt: null,
      blockerAttention: {
        state: "attention",
        reason: null,
        unresolvedBlockerCount: 1,
        coveredBlockerCount: 0,
        stalledBlockerCount: 0,
        attentionBlockerCount: 1,
        sampleBlockerIdentifier: null,
        sampleStalledBlockerIdentifier: null,
      },
    };
    const agent = {
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
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      urlKey: "agent",
    };

    const apiClient = {
      get: async (path: string) => {
        if (path === "/api/health") {
          return {
            ok: true as const,
            value: {
              status: "ok",
              version: "1.0.0",
              deploymentMode: "local",
              deploymentExposure: "private",
              authReady: true,
              bootstrapStatus: "ready",
              bootstrapInviteActive: false,
              features: {},
            },
          };
        }
        if (path === "/api/auth/get-session") {
          return { ok: true as const, value: { session: null, user: null } };
        }
        if (path === "/api/auth/profile") {
          return { ok: true as const, value: { id: "u1", email: null, name: null, image: null } };
        }
        if (path === "/api/companies") {
          return { ok: true as const, value: [company] };
        }
        if (path === "/api/companies/c1") {
          return { ok: true as const, value: company };
        }
        if (path === "/api/adapters") {
          return {
            ok: true as const,
            value: [
              {
                type: "openai",
                label: "OpenAI",
                source: "env",
                modelsCount: 1,
                loaded: true,
                disabled: false,
                capabilities: {
                  supportsInstructionsBundle: true,
                  supportsSkills: true,
                  supportsLocalAgentJwt: false,
                  requiresMaterializedRuntimeSkills: false,
                },
                overridePaused: false,
              },
            ],
          };
        }
        if (path === "/api/plugins") {
          return { ok: true as const, value: [{ id: "pl1", name: "Plugin" }] };
        }
        if (path === "/api/companies/c1/agents" || path === "/api/companies/default/agents") {
          return { ok: true as const, value: [agent] };
        }
        if (path === "/api/companies/c1/agents/a1" || path === "/api/companies/default/agents/a1") {
          return { ok: true as const, value: agent };
        }
        if (path === "/api/companies/c1/projects" || path === "/api/companies/default/projects") {
          return { ok: true as const, value: [project] };
        }
        if (path === "/api/companies/c1/projects/p1") {
          return { ok: true as const, value: project };
        }
        if (path.startsWith("/api/companies/c1/issues")) {
          return { ok: true as const, value: [issue] };
        }
        if (path === "/api/companies/c1/issues/i1") {
          return { ok: true as const, value: issue };
        }
        return { ok: false as const, error: new Error(`Unhandled path ${path}`) };
      },
    };

    const fakeContainer = {
      getApiClient: () => apiClient,
      getProjectApplicationService: () => ({
        listProjects: async () => ({ ok: true as const, value: [project] }),
        getProject: async () => ({ ok: true as const, value: project }),
      }),
      getIssueApplicationService: () => ({
        listIssues: async () => ({ ok: true as const, value: [issue] }),
        getIssue: async () => ({ ok: true as const, value: issue }),
        listIssuesByProject: async () => ({ ok: true as const, value: [issue] }),
      }),
      getRoutineApplicationService: () => ({
        listRoutines: async () => ({
          ok: true as const,
          value: [{ id: "routine-i1", name: issue.title }],
        }),
        getRoutine: async () => ({
          ok: true as const,
          value: { id: "routine-i1", name: issue.title },
        }),
        listRoutineRuns: async () => ({
          ok: true as const,
          value: [{ id: "i1", status: issue.status, createdAt: issue.createdAt }],
        }),
        getRoutineRun: async () => ({
          ok: true as const,
          value: { id: "i1", status: issue.status, createdAt: issue.createdAt },
        }),
        listFailedRoutineRuns: async () => ({
          ok: true as const,
          value: [{ id: "i1", status: "blocked", createdAt: issue.createdAt }],
        }),
        getRoutineSchedule: async () => ({
          ok: true as const,
          value: { nextRunAt: "2026-01-02T00:00:00.000Z", frequency: "daily" },
        }),
      }),
      getCompanyApplicationService: () => ({
        listCompanies: async () => ({ ok: true as const, value: { items: [] } }),
      }),
    };

    const server = new FakeServer();
    registerPaperclipTools(server as never, fakeContainer as never);

    expect(server.handlers.has("paperclip_get_health")).toBe(true);
    expect(server.handlers.has("paperclip_list_companies")).toBe(true);
    expect(server.handlers.has("paperclip_list_agents")).toBe(true);
    expect(server.handlers.has("paperclip_list_issues")).toBe(true);

    const health = await server.handlers.get("paperclip_get_health")?.({ response_format: "json" });
    expect(health?.isError).toBeUndefined();
    expect(health?.content?.[0]?.text).toContain('"status": "ok"');

    const companies = await server.handlers.get("paperclip_list_companies")?.({
      limit: 20,
      offset: 0,
      response_format: "json",
    });
    expect(companies?.structuredContent).toMatchObject({
      total: 1,
      count: 1,
      offset: 0,
      has_more: false,
    });

    const calls = [
      ["paperclip_get_session", { response_format: "json" }],
      ["paperclip_get_profile", { response_format: "json" }],
      ["paperclip_get_company", { company_id: "c1", response_format: "json" }],
      ["paperclip_list_adapters", { limit: 20, offset: 0, response_format: "json" }],
      ["paperclip_list_plugins", { limit: 20, offset: 0, response_format: "json" }],
      [
        "paperclip_list_agents",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      ["paperclip_get_agent", { company_id: "c1", agent_id: "a1", response_format: "json" }],
      [
        "paperclip_list_projects",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      ["paperclip_get_project", { company_id: "c1", project_id: "p1", response_format: "json" }],
      [
        "paperclip_list_issues",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      ["paperclip_get_issue", { company_id: "c1", issue_id: "i1", response_format: "json" }],
      [
        "paperclip_list_pending_approvals",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_get_approval_request",
        { company_id: "c1", issue_id: "i1", response_format: "json" },
      ],
      [
        "paperclip_list_high_risk_actions",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      ["paperclip_get_agent_status", { company_id: "c1", agent_id: "a1", response_format: "json" }],
      [
        "paperclip_get_agent_workload",
        { company_id: "c1", agent_id: "a1", response_format: "json" },
      ],
      [
        "paperclip_get_agent_recent_activity",
        { company_id: "c1", agent_id: "a1", response_format: "json" },
      ],
      [
        "paperclip_get_agent_capabilities",
        { company_id: "c1", agent_id: "a1", response_format: "json" },
      ],
      [
        "paperclip_get_project_status",
        { company_id: "c1", project_id: "p1", response_format: "json" },
      ],
      [
        "paperclip_get_project_risks",
        { company_id: "c1", project_id: "p1", response_format: "json" },
      ],
      [
        "paperclip_list_project_agents",
        { company_id: "c1", project_id: "p1", response_format: "json" },
      ],
      [
        "paperclip_list_project_tasks",
        { company_id: "c1", project_id: "p1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_list_blocked_tasks",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_list_overdue_tasks",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_list_unassigned_tasks",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_get_task_dependencies",
        { company_id: "c1", issue_id: "i1", response_format: "json" },
      ],
      ["paperclip_list_routines", { company_id: "c1", response_format: "json" }],
      [
        "paperclip_get_routine",
        { company_id: "c1", routine_id: "routine-i1", response_format: "json" },
      ],
      [
        "paperclip_list_routine_runs",
        {
          company_id: "c1",
          routine_id: "routine-i1",
          limit: 20,
          offset: 0,
          response_format: "json",
        },
      ],
      ["paperclip_get_routine_run", { company_id: "c1", run_id: "i1", response_format: "json" }],
      [
        "paperclip_list_failed_routine_runs",
        { company_id: "c1", limit: 20, offset: 0, response_format: "json" },
      ],
      [
        "paperclip_get_routine_schedule",
        { company_id: "c1", routine_id: "routine-i1", response_format: "json" },
      ],
    ] as const;
    for (const [name, input] of calls) {
      const result = await server.handlers.get(name)?.(input);
      expect(result?.isError, name).toBeUndefined();
    }
  });
});
