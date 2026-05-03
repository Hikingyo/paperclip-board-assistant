import type {
  PaperclipAgent,
  PaperclipCompany,
  PaperclipIssue,
  PaperclipProject,
} from "../../src/types.js";

/**
 * Test fixtures for Paperclip domain models
 * Used across all test suites to ensure consistency
 */

export const CompanyFixtures = {
  /**
   * Sample company for testing
   */
  minimal: (): PaperclipCompany => ({
    id: "test-company-1",
    name: "Test Company",
    icon: null,
    members: [],
    workflows: [],
    approvals: [],
    routines: [],
    agents: [],
    projects: [],
    uncompletedTasks: [],
    blockerAttention: {
      state: "healthy",
      reason: null,
      unresolvedBlockerCount: 0,
      coveredBlockerCount: 0,
      stalledBlockerCount: 0,
      attentionBlockerCount: 0,
      sampleBlockerIdentifier: null,
      sampleStalledBlockerIdentifier: null,
    },
  }),

  /**
   * Full company with all nested resources
   */
  full: (): PaperclipCompany => ({
    id: "test-company-full",
    name: "Full Test Company",
    icon: "https://example.com/icon.png",
    members: [
      {
        id: "member-1",
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://example.com/avatar.jpg",
        role: "admin",
      },
    ],
    workflows: [
      {
        id: "workflow-1",
        name: "Deployment Flow",
        identifier: "deploy",
        tasks: [],
      },
    ],
    approvals: [],
    routines: [],
    agents: [],
    projects: [],
    uncompletedTasks: [],
    blockerAttention: {
      state: "warning",
      reason: "High blocker count",
      unresolvedBlockerCount: 5,
      coveredBlockerCount: 3,
      stalledBlockerCount: 2,
      attentionBlockerCount: 1,
      sampleBlockerIdentifier: "blocker-123",
      sampleStalledBlockerIdentifier: "stalled-456",
    },
  }),
};

export const AgentFixtures = {
  minimal: (): PaperclipAgent => ({
    id: "agent-1",
    name: "Test Agent",
    description: null,
    model: "gpt-4",
    status: "idle",
    version: 1,
    configuration: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  running: (): PaperclipAgent => ({
    id: "agent-running",
    name: "Active Agent",
    description: "Currently processing tasks",
    model: "gpt-4",
    status: "running",
    version: 2,
    configuration: { timeout: 300 },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};

export const ProjectFixtures = {
  minimal: (): PaperclipProject => ({
    id: "project-1",
    name: "Test Project",
    description: null,
    status: "active",
    identifier: "TEST",
    workflows: [],
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};

export const IssueFixtures = {
  minimal: (): PaperclipIssue => ({
    id: "issue-1",
    title: "Test Issue",
    description: null,
    status: "open",
    priority: "medium",
    projectId: "project-1",
    assignee: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  blocking: (): PaperclipIssue => ({
    id: "issue-blocking",
    title: "Blocker Issue",
    description: "This issue is blocking other work",
    status: "blocked",
    priority: "high",
    projectId: "project-1",
    assignee: {
      id: "user-1",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
  }),
};

export const fixtures = {
  companies: CompanyFixtures,
  agents: AgentFixtures,
  projects: ProjectFixtures,
  issues: IssueFixtures,
};

export default fixtures;
