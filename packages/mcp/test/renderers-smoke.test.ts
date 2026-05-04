import { describe, expect, it } from "vitest";

import {
  renderAdapters,
  renderAgent,
  renderAgentCapabilities,
  renderAgentRecentActivity,
  renderAgentStatus,
  renderAgentWorkload,
  renderApprovalRequest,
  renderBlockedTasks,
  renderHighRiskActions,
  renderIssue,
  renderIssues,
  renderOverdueTasks,
  renderPendingApprovals,
  renderPlugins,
  renderProject,
  renderProjectRisks,
  renderProjectStatus,
  renderProjectTasks,
  renderRoutine,
  renderRoutineRun,
  renderRoutineRuns,
  renderRoutineSchedule,
  renderRoutines,
  renderTaskDependencies,
  renderUnassignedTasks,
} from "../src/tools/paperclip-renderers.js";
import type {
  PaginatedResult,
  PaperclipAgent,
  PaperclipIssue,
  PaperclipPlugin,
  PaperclipProject,
} from "../src/types.js";

const agent: PaperclipAgent = {
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
};

const project: PaperclipProject = {
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

const issue: PaperclipIssue = {
  id: "i1",
  companyId: "c1",
  projectId: "p1",
  projectWorkspaceId: null,
  goalId: null,
  parentId: null,
  title: "Issue",
  description: null,
  status: "open",
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
  createdAt: "2026-01-01",
  updatedAt: "2026-01-02",
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

const page = <T>(items: T[]): PaginatedResult<T> => ({
  items,
  total: items.length,
  count: items.length,
  offset: 0,
  has_more: false,
});

describe("renderer smoke coverage", () => {
  it("renders agent/project/issue oriented views", () => {
    expect(renderAgent(agent)).toContain("Agent");
    expect(renderAgentStatus(agent)).toContain("Status");
    expect(renderAgentCapabilities(agent)).toContain("Capabilities");
    expect(renderAgentWorkload({ ...agent, assignedIssueCount: 1 })).toContain("Assigned");
    expect(renderAgentRecentActivity({ agent, recentIssues: [issue] })).toContain("Recent");

    expect(renderProject(project)).toContain("Project");
    expect(
      renderProjectStatus({
        ...project,
        totalIssues: 1,
        openIssues: 1,
        blockedIssues: 1,
        doneIssues: 0,
      }),
    ).toContain("Total");
    expect(renderProjectRisks([issue])).toContain("Risk");
    expect(renderProjectTasks(page([issue]))).toContain("Tasks");

    expect(renderIssue(issue)).toContain("Issue");
    expect(renderIssues(page([issue]))).toContain("Issues");
    expect(
      renderTaskDependencies({
        task: issue,
        blockerTasks: [issue],
        dependentTasks: [issue],
      }),
    ).toContain("Dependencies");
  });

  it("renders approvals/routines and generic lists", () => {
    expect(
      renderAdapters(
        page([
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
        ]),
      ),
    ).toContain("OpenAI");
    const plugins: PaperclipPlugin[] = [{ id: "pl1", name: "Plugin" }];
    expect(renderPlugins(page(plugins))).toContain("Plugin");

    expect(renderBlockedTasks(page([issue]))).toContain("Blocked");
    expect(renderOverdueTasks(page([issue]))).toContain("Overdue");
    expect(renderUnassignedTasks(page([issue]))).toContain("Unassigned");
    expect(renderPendingApprovals(page([issue]))).toContain("Approvals");
    expect(renderApprovalRequest(issue)).toContain("Approval");
    expect(renderHighRiskActions(page([issue]))).toContain("Risk");

    expect(renderRoutines([{ id: "r1", name: "Routine" }])).toContain("Routine");
    expect(renderRoutine({ id: "r1", name: "Routine" })).toContain("Routine");
    expect(renderRoutineRuns([{ id: "run1", status: "done", createdAt: "2026-01-01" }])).toContain(
      "2026-01-01",
    );
    expect(renderRoutineRun({ id: "run1", status: "done", createdAt: "2026-01-01" })).toContain(
      "Status",
    );
    expect(renderRoutineSchedule({ nextRunAt: "2026-01-02", frequency: "daily" })).toContain(
      "daily",
    );
  });
});
