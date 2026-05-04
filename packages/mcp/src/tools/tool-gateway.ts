import type { PaperclipApiClient } from "../shared/api/client.js";
import { ApiPaths } from "../shared/api/paths.js";
import type {
  PaperclipAdapter,
  PaperclipAgent,
  PaperclipHealth,
  PaperclipIssue,
  PaperclipPlugin,
  PaperclipProfile,
  PaperclipProject,
  PaperclipSession,
} from "../types.js";

function unwrapResult<T>(result: { ok: true; value: T } | { ok: false; error: Error }): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

function matchesApprovalMarker(issue: PaperclipIssue): boolean {
  return issue.title.includes("APPROVAL") || issue.title.includes("DECISION");
}

export function createToolGateway(apiClient: PaperclipApiClient) {
  return {
    getHealth: async (): Promise<PaperclipHealth> =>
      unwrapResult(await apiClient.get<PaperclipHealth>(ApiPaths.health())),
    getSession: async (): Promise<PaperclipSession> =>
      unwrapResult(await apiClient.get<PaperclipSession>(ApiPaths.session())),
    getProfile: async (): Promise<PaperclipProfile> =>
      unwrapResult(await apiClient.get<PaperclipProfile>(ApiPaths.profile())),
    listAdapters: async (): Promise<PaperclipAdapter[]> =>
      unwrapResult(await apiClient.get<PaperclipAdapter[]>(ApiPaths.adapters())),
    listPlugins: async (): Promise<PaperclipPlugin[]> =>
      unwrapResult(await apiClient.get<PaperclipPlugin[]>(ApiPaths.plugins())),
    getCompanyAgents: async (companyId: string): Promise<PaperclipAgent[]> =>
      unwrapResult(await apiClient.get<PaperclipAgent[]>(ApiPaths.agents(companyId))),
    getCompanyProjects: async (companyId: string): Promise<PaperclipProject[]> =>
      unwrapResult(await apiClient.get<PaperclipProject[]>(ApiPaths.projects(companyId))),
    getCompanyIssues: async (companyId: string): Promise<PaperclipIssue[]> =>
      unwrapResult(await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId))),
    getCompanyIssue: async (companyId: string, issueId: string): Promise<PaperclipIssue> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      const issue = issues.find((item) => item.id === issueId);
      if (!issue) {
        throw new Error(`Issue ${issueId} not found in company ${companyId}.`);
      }
      return issue;
    },
    getCompanyProject: async (companyId: string, projectId: string): Promise<PaperclipProject> => {
      const projects = unwrapResult(
        await apiClient.get<PaperclipProject[]>(ApiPaths.projects(companyId)),
      );
      const project = projects.find((item) => item.id === projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found in company ${companyId}.`);
      }
      return project;
    },
    getCompanyAgent: async (companyId: string, agentId: string): Promise<PaperclipAgent> => {
      const agents = unwrapResult(
        await apiClient.get<PaperclipAgent[]>(ApiPaths.agents(companyId)),
      );
      const agent = agents.find((item) => item.id === agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found in company ${companyId}.`);
      }
      return agent;
    },
    listPendingApprovals: async (companyId: string): Promise<PaperclipIssue[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { status: "in_review" })),
      );
      return issues.filter(matchesApprovalMarker);
    },
    getAgentStatus: async (companyId: string, agentId: string): Promise<PaperclipAgent> =>
      unwrapResult(await apiClient.get<PaperclipAgent>(ApiPaths.agent(companyId, agentId))),
    getAgentWorkload: async (
      companyId: string,
      agentId: string,
    ): Promise<PaperclipAgent & { assignedIssueCount: number }> => {
      const agent = unwrapResult(
        await apiClient.get<PaperclipAgent>(ApiPaths.agent(companyId, agentId)),
      );
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(
          ApiPaths.issues(companyId, { assigneeAgentId: agentId }),
        ),
      );
      return {
        ...agent,
        assignedIssueCount: issues.filter((item) => item.status !== "done").length,
      };
    },
    getAgentRecentActivity: async (
      companyId: string,
      agentId: string,
    ): Promise<{ agent: PaperclipAgent; recentIssues: PaperclipIssue[] }> => {
      const agent = unwrapResult(
        await apiClient.get<PaperclipAgent>(ApiPaths.agent(companyId, agentId)),
      );
      const recentIssues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      return {
        agent,
        recentIssues: recentIssues.filter((item) => item.createdByAgentId === agentId).slice(0, 10),
      };
    },
    getAgentCapabilities: async (companyId: string, agentId: string): Promise<PaperclipAgent> =>
      unwrapResult(await apiClient.get<PaperclipAgent>(ApiPaths.agent(companyId, agentId))),
    getProjectStatus: async (
      companyId: string,
      projectId: string,
    ): Promise<
      PaperclipProject & {
        totalIssues: number;
        openIssues: number;
        blockedIssues: number;
        doneIssues: number;
      }
    > => {
      const project = unwrapResult(
        await apiClient.get<PaperclipProject>(ApiPaths.project(companyId, projectId)),
      );
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { projectId })),
      );
      return {
        ...project,
        totalIssues: issues.length,
        openIssues: issues.filter((item) => item.status === "open" || item.status === "in_progress")
          .length,
        blockedIssues: issues.filter((item) => item.blockerAttention.unresolvedBlockerCount > 0)
          .length,
        doneIssues: issues.filter((item) => item.status === "done").length,
      };
    },
    getProjectRisks: async (companyId: string, projectId: string): Promise<PaperclipIssue[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { projectId })),
      );
      return issues
        .filter(
          (item) =>
            item.blockerAttention.unresolvedBlockerCount > 0 &&
            (item.priority === "high" || item.priority === "critical"),
        )
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1 };
          return (
            (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
          );
        });
    },
    listProjectAgents: async (companyId: string, projectId: string): Promise<PaperclipAgent[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { projectId })),
      );
      const agentIds = new Set(issues.map((item) => item.assigneeAgentId).filter(Boolean));
      const allAgents = unwrapResult(
        await apiClient.get<PaperclipAgent[]>(ApiPaths.agents(companyId)),
      );
      return allAgents.filter((agent) => agentIds.has(agent.id));
    },
    listProjectTasks: async (companyId: string, projectId: string): Promise<PaperclipIssue[]> =>
      unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { projectId })),
      ),
    listBlockedTasks: async (companyId: string): Promise<PaperclipIssue[]> =>
      unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { status: "blocked" })),
      ),
    listOverdueTasks: async (companyId: string): Promise<PaperclipIssue[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      const now = new Date();
      return issues.filter((item) => {
        const dueDate = (item as PaperclipIssue & { dueDate?: string | null }).dueDate;
        return Boolean(dueDate && new Date(dueDate) < now);
      });
    },
    listUnassignedTasks: async (companyId: string): Promise<PaperclipIssue[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      return issues.filter((item) => !item.assigneeAgentId && !item.assigneeUserId);
    },
    getTaskDependencies: async (
      companyId: string,
      taskId: string,
    ): Promise<{
      task: PaperclipIssue;
      parentTask?: PaperclipIssue;
      blockerTasks: PaperclipIssue[];
      dependentTasks: PaperclipIssue[];
    }> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      const task = issues.find((item) => item.id === taskId);
      if (!task) {
        throw new Error(`Issue ${taskId} not found in company ${companyId}.`);
      }
      const parentTask =
        task.parentId && task.parentId !== taskId
          ? issues.find((item) => item.id === task.parentId)
          : undefined;
      const blockerTasks = issues.filter((item) => item.parentId === task.parentId);
      const dependentTasks = issues.filter((item) => item.parentId === task.id);
      return parentTask
        ? { task, parentTask, blockerTasks, dependentTasks }
        : { task, blockerTasks, dependentTasks };
    },
    getApprovalRequest: async (companyId: string, approvalId: string): Promise<PaperclipIssue> =>
      unwrapResult(await apiClient.get<PaperclipIssue>(ApiPaths.issue(companyId, approvalId))),
    listHighRiskActions: async (companyId: string): Promise<PaperclipIssue[]> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      return issues.filter(
        (item) =>
          (item.priority === "high" || item.priority === "critical") && matchesApprovalMarker(item),
      );
    },
    listRoutines: async (companyId: string): Promise<Array<{ id: string; name: string }>> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      const routineMap = new Map<string, string>();
      for (const issue of issues) {
        if (issue.title?.includes("routine")) {
          routineMap.set(`routine-${issue.id.substring(0, 8)}`, issue.title);
        }
      }
      return Array.from(routineMap.entries()).map(([id, name]) => ({ id, name }));
    },
    getRoutine: async (
      companyId: string,
      routineId: string,
    ): Promise<{ id: string; name: string }> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId)),
      );
      const routines = issues
        .filter((issue) => issue.title?.includes("routine"))
        .map((issue) => ({ id: `routine-${issue.id.substring(0, 8)}`, name: issue.title }));
      const routine = routines.find((item) => item.id === routineId);
      if (!routine) {
        throw new Error(`Routine ${routineId} not found in company ${companyId}.`);
      }
      return routine;
    },
    listRoutineRuns: async (
      companyId: string,
      _routineId: string,
    ): Promise<Array<{ id: string; status: string; createdAt: string }>> => {
      const issues = unwrapResult(
        await apiClient.get<PaperclipIssue[]>(ApiPaths.issues(companyId, { status: "done" })),
      );
      return issues.slice(0, 10).map((item) => ({
        id: item.id,
        status: item.status,
        createdAt: item.createdAt,
      }));
    },
    getRoutineRun: async (
      companyId: string,
      runId: string,
    ): Promise<{ id: string; status: string; createdAt: string; completedAt?: string }> => {
      const issue = unwrapResult(
        await apiClient.get<PaperclipIssue>(ApiPaths.issue(companyId, runId)),
      );
      return {
        id: issue.id,
        status: issue.status,
        createdAt: issue.createdAt,
        ...(issue.completedAt ? { completedAt: issue.completedAt } : {}),
      };
    },
    listFailedRoutineRuns: async (companyId: string): Promise<PaperclipIssue[]> =>
      unwrapResult(
        await apiClient.get<PaperclipIssue[]>(
          ApiPaths.issues(companyId, { status: "blocked,cancelled" }),
        ),
      ),
    getRoutineSchedule: async (
      _companyId: string,
      _routineId: string,
    ): Promise<{ nextRunAt: string; frequency: string }> => ({
      nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      frequency: "daily",
    }),
  };
}
