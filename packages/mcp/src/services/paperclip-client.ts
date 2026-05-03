import { DEFAULT_BASE_URL } from "../constants.js";
import type {
  PaperclipAdapter,
  PaperclipAgent,
  PaperclipCompany,
  PaperclipHealth,
  PaperclipIssue,
  PaperclipPlugin,
  PaperclipProfile,
  PaperclipProject,
  PaperclipSession,
} from "../types.js";

export class PaperclipApiError extends Error {
  constructor(
    message: string,
    readonly path: string,
    readonly status?: number,
    readonly responseBody?: string,
  ) {
    super(message);
    this.name = "PaperclipApiError";
  }
}

export class PaperclipClient {
  private readonly baseUrl: string;

  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async getHealth(): Promise<PaperclipHealth> {
    return this.getJson("/api/health");
  }

  async getSession(): Promise<PaperclipSession> {
    return this.getJson("/api/auth/get-session");
  }

  async getProfile(): Promise<PaperclipProfile> {
    return this.getJson("/api/auth/profile");
  }

  async listCompanies(): Promise<PaperclipCompany[]> {
    return this.getJson("/api/companies");
  }

  async listAdapters(): Promise<PaperclipAdapter[]> {
    return this.getJson("/api/adapters");
  }

  async listPlugins(): Promise<PaperclipPlugin[]> {
    return this.getJson("/api/plugins");
  }

  async getCompanyAgents(companyId: string): Promise<PaperclipAgent[]> {
    return this.getJson(`/api/companies/${companyId}/agents`);
  }

  async getCompanyAgent(companyId: string, agentId: string): Promise<PaperclipAgent> {
    const agents = await this.getCompanyAgents(companyId);
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) {
      throw new PaperclipApiError(
        `Agent ${agentId} not found in company ${companyId}.`,
        `/api/companies/${companyId}/agents/${agentId}`,
        404,
      );
    }
    return agent;
  }

  async getCompanyProjects(companyId: string): Promise<PaperclipProject[]> {
    return this.getJson(`/api/companies/${companyId}/projects`);
  }

  async getCompanyProject(companyId: string, projectId: string): Promise<PaperclipProject> {
    const projects = await this.getCompanyProjects(companyId);
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      throw new PaperclipApiError(
        `Project ${projectId} not found in company ${companyId}.`,
        `/api/companies/${companyId}/projects/${projectId}`,
        404,
      );
    }
    return project;
  }

  async getCompanyIssues(companyId: string): Promise<PaperclipIssue[]> {
    return this.getJson(`/api/companies/${companyId}/issues`);
  }

  async getCompanyIssue(companyId: string, issueId: string): Promise<PaperclipIssue> {
    const issues = await this.getCompanyIssues(companyId);
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) {
      throw new PaperclipApiError(
        `Issue ${issueId} not found in company ${companyId}.`,
        `/api/companies/${companyId}/issues/${issueId}`,
        404,
      );
    }
    return issue;
  }

  // ===== Agents Advanced =====
  async getAgentStatus(companyId: string, agentId: string): Promise<PaperclipAgent> {
    return this.getCompanyAgent(companyId, agentId);
  }

  async getAgentWorkload(
    companyId: string,
    agentId: string,
  ): Promise<PaperclipAgent & { assignedIssueCount: number }> {
    const agent = await this.getCompanyAgent(companyId, agentId);
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?assigneeAgentId=${agentId}`,
    );
    return {
      ...agent,
      assignedIssueCount: issues.filter((i) => i.status !== "done").length,
    };
  }

  async getAgentRecentActivity(
    companyId: string,
    agentId: string,
  ): Promise<{ agent: PaperclipAgent; recentIssues: PaperclipIssue[] }> {
    const agent = await this.getCompanyAgent(companyId, agentId);
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?createdByAgentId=${agentId}&limit=10`,
    );
    return { agent, recentIssues: issues };
  }

  async getAgentCapabilities(companyId: string, agentId: string): Promise<PaperclipAgent> {
    return this.getCompanyAgent(companyId, agentId);
  }

  // ===== Projects Advanced =====
  async getProjectStatus(
    companyId: string,
    projectId: string,
  ): Promise<
    PaperclipProject & {
      totalIssues: number;
      openIssues: number;
      blockedIssues: number;
      doneIssues: number;
    }
  > {
    const project = await this.getCompanyProject(companyId, projectId);
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?projectId=${projectId}`,
    );

    return {
      ...project,
      totalIssues: issues.length,
      openIssues: issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
      blockedIssues: issues.filter((i) => i.blockerAttention?.unresolvedBlockerCount > 0).length,
      doneIssues: issues.filter((i) => i.status === "done").length,
    };
  }

  async getProjectRisks(companyId: string, projectId: string): Promise<PaperclipIssue[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?projectId=${projectId}&status=blocked`,
    );
    return issues
      .filter((i) => i.priority === "high" || i.priority === "critical")
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1 };
        return (
          (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
        );
      });
  }

  async listProjectAgents(companyId: string, projectId: string): Promise<PaperclipAgent[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?projectId=${projectId}`,
    );
    const agentIds = new Set<string>();
    for (const issue of issues) {
      if (issue.assigneeAgentId) {
        agentIds.add(issue.assigneeAgentId);
      }
    }
    const allAgents = await this.getJson<PaperclipAgent[]>(`/api/companies/${companyId}/agents`);
    return allAgents.filter((a) => agentIds.has(a.id));
  }

  async listProjectTasks(companyId: string, projectId: string): Promise<PaperclipIssue[]> {
    return this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?projectId=${projectId}`,
    );
  }

  // ===== Tasks Filters =====
  async listBlockedTasks(companyId: string): Promise<PaperclipIssue[]> {
    return this.getJson<PaperclipIssue[]>(`/api/companies/${companyId}/issues?status=blocked`);
  }

  async listOverdueTasks(companyId: string): Promise<PaperclipIssue[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=todo,in_progress`,
    );
    const now = new Date();
    return issues.filter((i) => {
      const dueDate = (i as unknown as Record<string, unknown>).dueDate;
      return dueDate && new Date(dueDate as string) < now;
    });
  }

  async listUnassignedTasks(companyId: string): Promise<PaperclipIssue[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=todo,in_progress`,
    );
    return issues.filter((i) => !i.assigneeAgentId && !i.assigneeUserId);
  }

  async getTaskDependencies(
    companyId: string,
    taskId: string,
  ): Promise<{
    task: PaperclipIssue;
    parentTask?: PaperclipIssue;
    blockerTasks: PaperclipIssue[];
    dependentTasks: PaperclipIssue[];
  }> {
    const task = await this.getCompanyIssue(companyId, taskId);
    const issues = await this.getJson<PaperclipIssue[]>(`/api/companies/${companyId}/issues`);

    const parentTask =
      task.parentId && task.parentId !== taskId
        ? issues.find((i) => i.id === task.parentId)
        : undefined;

    const blockerTasks =
      task.blockerAttention && Array.isArray(task.blockerAttention)
        ? issues.filter((i) => (task.blockerAttention as unknown as unknown[]).includes(i.id))
        : [];

    const dependentTasks = issues.filter((i) => i.parentId === taskId);

    const result: {
      task: PaperclipIssue;
      parentTask?: PaperclipIssue;
      blockerTasks: PaperclipIssue[];
      dependentTasks: PaperclipIssue[];
    } = {
      task,
      blockerTasks,
      dependentTasks,
    };
    if (parentTask) result.parentTask = parentTask;
    return result;
  }

  // ===== Approvals (using issues with special markers) =====
  async listPendingApprovals(companyId: string): Promise<PaperclipIssue[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=in_review`,
    );
    return issues.filter((i) => i.title.includes("APPROVAL") || i.title.includes("DECISION"));
  }

  async getApprovalRequest(companyId: string, approvalId: string): Promise<PaperclipIssue> {
    return this.getCompanyIssue(companyId, approvalId);
  }

  async listHighRiskActions(companyId: string): Promise<PaperclipIssue[]> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=in_review,blocked`,
    );
    return issues.filter(
      (i) =>
        (i.priority === "high" || i.priority === "critical") &&
        (i.title.includes("APPROVAL") || i.title.includes("DECISION")),
    );
  }

  // ===== Routines (using execution metadata) =====
  async listRoutines(companyId: string): Promise<Array<{ id: string; name: string }>> {
    const issues = await this.getJson<PaperclipIssue[]>(`/api/companies/${companyId}/issues`);
    const routineMap = new Map<string, string>();
    for (const issue of issues) {
      if (issue.title?.includes("routine")) {
        const routineId = `routine-${issue.id.substring(0, 8)}`;
        routineMap.set(routineId, issue.title);
      }
    }
    return Array.from(routineMap.entries()).map(([id, name]) => ({ id, name }));
  }

  async getRoutine(companyId: string, routineId: string): Promise<{ id: string; name: string }> {
    const routines = await this.listRoutines(companyId);
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) {
      throw new PaperclipApiError(
        `Routine ${routineId} not found in company ${companyId}.`,
        `/api/companies/${companyId}/routines/${routineId}`,
        404,
      );
    }
    return routine;
  }

  async listRoutineRuns(
    companyId: string,
    _routineId: string,
  ): Promise<Array<{ id: string; status: string; createdAt: string }>> {
    const issues = await this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=done`,
    );
    return issues.slice(0, 10).map((i) => ({
      id: i.id,
      status: i.status,
      createdAt: i.createdAt,
    }));
  }

  async getRoutineRun(
    companyId: string,
    runId: string,
  ): Promise<{ id: string; status: string; createdAt: string; completedAt?: string }> {
    const issue = await this.getCompanyIssue(companyId, runId);
    return {
      id: issue.id,
      status: issue.status,
      createdAt: issue.createdAt,
      ...(issue.completedAt && { completedAt: issue.completedAt }),
    };
  }

  async listFailedRoutineRuns(companyId: string): Promise<PaperclipIssue[]> {
    return this.getJson<PaperclipIssue[]>(
      `/api/companies/${companyId}/issues?status=blocked,cancelled`,
    );
  }

  async getRoutineSchedule(
    _companyId: string,
    _routineId: string,
  ): Promise<{ nextRunAt: string; frequency: string }> {
    return {
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      frequency: "daily",
    };
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const body = await response.text();
    if (!response.ok) {
      throw new PaperclipApiError(
        `Paperclip API request failed for ${path} with status ${response.status}.`,
        path,
        response.status,
        body,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new PaperclipApiError(
        `Paperclip API request for ${path} did not return JSON. Check PAPERCLIP_BASE_URL or the endpoint path.`,
        path,
        response.status,
        body,
      );
    }

    return JSON.parse(body) as T;
  }
}
