import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { presentDetail, presentList } from "../presentation/tool-presenter.js";
import {
  agentReadOnlyGetSchema,
  companyReadOnlyGetSchema,
  companyReadOnlyListSchema,
  issueReadOnlyGetSchema,
  projectReadOnlyGetSchema,
  readOnlyGetSchema,
  readOnlyListSchema,
} from "../schemas.js";
import { ApiPaths } from "../shared/api/paths.js";
import type { ServiceContainer } from "../shared/container.js";
import type {
  PaginatedResult,
  PaperclipAgent,
  PaperclipCompany,
  PaperclipIssue,
} from "../types.js";
import {
  buildCompanyActivityFeed,
  buildCompanyBoardSummary,
  buildCompanyExecutionSummary,
  buildCompanyMetrics,
  buildCompanyPolicies,
} from "./paperclip-company-insights.js";
import {
  renderAgentRecentActivity,
  renderAgents,
  renderAgentWorkload,
  renderBlockedTasks,
  renderCompanyActivityFeed,
  renderCompanyBoardSummary,
  renderCompanyExecutionSummary,
  renderCompanyMetrics,
  renderCompanyPolicies,
  renderOverdueTasks,
  renderProjectRisks,
  renderProjectStatus,
  renderProjectTasks,
  renderRoutineRun,
  renderRoutineRuns,
  renderRoutineSchedule,
  renderTaskDependencies,
  renderUnassignedTasks,
} from "./paperclip-renderers.js";
import {
  createErrorResult,
  createTextResult,
  paginate,
  resolveRequestedItem,
  selectText,
} from "./paperclip-tool-helpers.js";
import { createToolGateway } from "./tool-gateway.js";

function unwrapResult<T>(result: { ok: true; value: T } | { ok: false; error: Error }): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

async function resolveCompany(
  container: ServiceContainer,
  companyId?: string,
): Promise<PaperclipCompany> {
  const apiClient = container.getApiClient();
  if (companyId) {
    return unwrapResult(await apiClient.get<PaperclipCompany>(ApiPaths.company(companyId)));
  }

  const items = unwrapResult(await apiClient.get<PaperclipCompany[]>(ApiPaths.companies()));
  return resolveRequestedItem(items, {
    itemId: undefined,
    resourceName: "company",
    resourceNamePlural: "companies",
    idFieldName: "id",
  });
}

function registerCoreTools(server: McpServer, client: ReturnType<typeof createToolGateway>): void {
  server.registerTool(
    "paperclip_get_health",
    {
      title: "Get Paperclip health",
      description: "Read the Paperclip instance health and deployment metadata from /api/health.",
      inputSchema: readOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format = "markdown" }) => {
      try {
        const health = await client.getHealth();
        return presentDetail(
          "Paperclip health",
          health as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_session",
    {
      title: "Get Paperclip session",
      description: "Read the current Paperclip session identity from /api/auth/get-session.",
      inputSchema: readOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format = "markdown" }) => {
      try {
        const session = await client.getSession();
        return presentDetail(
          "Paperclip session",
          session as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_profile",
    {
      title: "Get Paperclip profile",
      description: "Read the current Paperclip user profile from /api/auth/profile.",
      inputSchema: readOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format = "markdown" }) => {
      try {
        const profile = await client.getProfile();
        return presentDetail(
          "Paperclip profile",
          profile as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_adapters",
    {
      title: "List Paperclip adapters",
      description:
        "List adapters available to the Paperclip instance, including capability flags and model counts.",
      inputSchema: readOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const adapters = await client.listAdapters();
        const page = paginate(adapters, limit, offset);
        return presentList(
          "Paperclip adapters",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "adapters",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_plugins",
    {
      title: "List Paperclip plugins",
      description:
        "List plugins currently known to the Paperclip instance using client-side pagination.",
      inputSchema: readOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const plugins = await client.listPlugins();
        const page = paginate(plugins, limit, offset);
        return presentList(
          "Paperclip plugins",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "plugins",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );
}

export function registerPaperclipTools(server: McpServer, container: ServiceContainer): void {
  const client = createToolGateway(container.getApiClient());
  registerCoreTools(server, client);

  server.registerTool(
    "paperclip_company_execution_summary",
    {
      title: "Get Paperclip company execution summary",
      description:
        "Read a workflow-oriented execution summary across all visible companies using metadata already exposed by Paperclip.",
      inputSchema: readOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format = "markdown" }) => {
      try {
        const companies = unwrapResult(
          await container.getApiClient().get<PaperclipCompany[]>(ApiPaths.companies()),
        );
        const summary = buildCompanyExecutionSummary(companies);
        return createTextResult(
          selectText(response_format, summary, renderCompanyExecutionSummary),
          summary,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_company",
    {
      title: "Get Paperclip company",
      description:
        "Read a single company visible to the current Paperclip session. If only one company is visible, it is selected automatically.",
      inputSchema: companyReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id: companyId, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, companyId);
        return presentDetail(
          `Paperclip company: ${company.name}`,
          company as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_company_activity_feed",
    {
      title: "Get Paperclip company activity feed",
      description:
        "Read a derived activity feed for a visible company using timestamps and board signals already exposed by Paperclip company metadata.",
      inputSchema: companyReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id: companyId, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, companyId);
        const activityFeed = buildCompanyActivityFeed(company);
        return createTextResult(
          selectText(response_format, activityFeed, renderCompanyActivityFeed),
          activityFeed,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_company_board_summary",
    {
      title: "Get Paperclip company board summary",
      description:
        "Read a board-oriented summary for a visible company using company metadata already exposed by Paperclip.",
      inputSchema: companyReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id: companyId, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, companyId);
        const summary = buildCompanyBoardSummary(company);
        return createTextResult(
          selectText(response_format, summary, renderCompanyBoardSummary),
          summary,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_company_metrics",
    {
      title: "Get Paperclip company metrics",
      description:
        "Read derived budget, issue, and attachment metrics for a visible company using company metadata already exposed by Paperclip.",
      inputSchema: companyReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id: companyId, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, companyId);
        const metrics = buildCompanyMetrics(company);
        return createTextResult(
          selectText(response_format, metrics, renderCompanyMetrics),
          metrics,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_company_policies",
    {
      title: "Get Paperclip company policies",
      description:
        "Read governance and policy signals for a visible company using company metadata already exposed by Paperclip.",
      inputSchema: companyReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id: companyId, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, companyId);
        const policies = buildCompanyPolicies(company);
        return createTextResult(
          selectText(response_format, policies, renderCompanyPolicies),
          policies,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_companies",
    {
      title: "List Paperclip companies",
      description:
        "List companies visible to the current Paperclip session using client-side pagination.",
      inputSchema: readOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const companies = unwrapResult(
          await container.getApiClient().get<PaperclipCompany[]>(ApiPaths.companies()),
        );
        const page = paginate(companies, limit, offset);
        return presentList(
          "Paperclip companies",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "items",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_agents",
    {
      description: "List all agents in a company.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const agents = await client.getCompanyAgents(company.id);
        const page = paginate(agents, limit, offset);
        return presentList(
          "Paperclip agents",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "agents",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_agent",
    {
      description: "Get details about a specific agent in a company.",
      inputSchema: agentReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, agent_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const agent = await client.getCompanyAgent(company.id, agent_id);
        return presentDetail(
          `Paperclip agent: ${agent.name}`,
          agent as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_projects",
    {
      description: "List projects in a company with pagination.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const projectsResult = await container
          .getProjectApplicationService()
          .listProjects(company.id);
        if (!projectsResult.ok) throw new Error(projectsResult.error.message);
        const projects = projectsResult.value;
        const page = paginate(projects, limit, offset);
        return presentList(
          "Paperclip projects",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "projects",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_project",
    {
      description: "Get details about a specific project in a company.",
      inputSchema: projectReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, project_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const projectResult = await container
          .getProjectApplicationService()
          .getProject(company.id, project_id);
        if (!projectResult.ok) throw new Error(projectResult.error.message);
        const project = projectResult.value;
        return presentDetail(
          `Paperclip project: ${project.name}`,
          project as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_issues",
    {
      description: "List issues/tasks in a company with pagination.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container.getIssueApplicationService().listIssues(company.id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value;
        const page = paginate(issues, limit, offset);
        return presentList(
          "Paperclip issues",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "issues",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_issue",
    {
      description: "Get details about a specific issue/task in a company.",
      inputSchema: issueReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, issue_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issueResult = await container
          .getIssueApplicationService()
          .getIssue(company.id, issue_id);
        if (!issueResult.ok) throw new Error(issueResult.error.message);
        const issue = issueResult.value;
        return presentDetail(
          `Paperclip issue: ${issue.title}`,
          issue as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  // ===== Agents Advanced =====
  server.registerTool(
    "paperclip_get_agent_status",
    {
      description: "Get status and health metrics for a specific agent.",
      inputSchema: agentReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, agent_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const agent = await client.getAgentStatus(company.id, agent_id);
        return presentDetail(
          `Paperclip agent status: ${agent.name}`,
          agent as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_agent_workload",
    {
      description: "Get workload information for a specific agent.",
      inputSchema: agentReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, agent_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const data = await client.getAgentWorkload(company.id, agent_id);
        return createTextResult(selectText(response_format, data, renderAgentWorkload), data);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_agent_recent_activity",
    {
      description: "Get recent activity and work history for a specific agent.",
      inputSchema: agentReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, agent_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const data = await client.getAgentRecentActivity(company.id, agent_id);
        return createTextResult(selectText(response_format, data, renderAgentRecentActivity), data);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_agent_capabilities",
    {
      description: "Get capabilities and skills for a specific agent.",
      inputSchema: agentReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, agent_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const agent = await client.getAgentCapabilities(company.id, agent_id);
        return presentDetail(
          `Paperclip agent capabilities: ${agent.name}`,
          agent as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  // ===== Projects Advanced =====
  server.registerTool(
    "paperclip_get_project_status",
    {
      description: "Get project status including issue counts and metrics.",
      inputSchema: projectReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, project_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const projectResult = await container
          .getProjectApplicationService()
          .getProject(company.id, project_id);
        const issuesResult = await container
          .getIssueApplicationService()
          .listIssuesByProject(company.id, project_id);
        if (!projectResult.ok) throw new Error(projectResult.error.message);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value;
        const data = {
          ...projectResult.value,
          totalIssues: issues.length,
          openIssues: issues.filter(
            (item) => item.status === "open" || item.status === "in_progress",
          ).length,
          blockedIssues: issues.filter((item) => item.blockerAttention.unresolvedBlockerCount > 0)
            .length,
          doneIssues: issues.filter((item) => item.status === "done").length,
        };
        return createTextResult(selectText(response_format, data, renderProjectStatus), data);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_project_risks",
    {
      description: "Get high-risk blocked issues in a project.",
      inputSchema: projectReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, project_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container
          .getIssueApplicationService()
          .listIssuesByProject(company.id, project_id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value
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
        const page: PaginatedResult<PaperclipIssue> = {
          items: issues,
          total: issues.length,
          count: issues.length,
          offset: 0,
          has_more: false,
        };
        return createTextResult(selectText(response_format, issues, renderProjectRisks), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_project_agents",
    {
      description: "List agents working on a project.",
      inputSchema: projectReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, project_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const agents = await client.listProjectAgents(company.id, project_id);
        const page: PaginatedResult<PaperclipAgent> = {
          items: agents,
          total: agents.length,
          count: agents.length,
          offset: 0,
          has_more: false,
        };
        return createTextResult(selectText(response_format, page, renderAgents), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_project_tasks",
    {
      description: "List tasks/issues in a project.",
      inputSchema: projectReadOnlyGetSchema.extend({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, project_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container
          .getIssueApplicationService()
          .listIssuesByProject(company.id, project_id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value;
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderProjectTasks), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  // ===== Tasks Filters =====
  server.registerTool(
    "paperclip_list_blocked_tasks",
    {
      description: "List all blocked tasks in a company.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container.getIssueApplicationService().listIssues(company.id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value.filter(
          (issue) => issue.blockerAttention.unresolvedBlockerCount > 0,
        );
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderBlockedTasks), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_overdue_tasks",
    {
      description: "List all overdue tasks in a company.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container.getIssueApplicationService().listIssues(company.id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const now = new Date();
        const issues = issuesResult.value.filter((issue) => {
          const dueDate = (issue as PaperclipIssue & { dueDate?: string | null }).dueDate;
          return Boolean(dueDate && new Date(dueDate) < now);
        });
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderOverdueTasks), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_unassigned_tasks",
    {
      description: "List all unassigned tasks in a company.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issuesResult = await container.getIssueApplicationService().listIssues(company.id);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const issues = issuesResult.value.filter(
          (issue) => !issue.assigneeAgentId && !issue.assigneeUserId,
        );
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderUnassignedTasks), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_task_dependencies",
    {
      description: "Get task dependencies including parent, blockers, and dependents.",
      inputSchema: issueReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, issue_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issueResult = await container
          .getIssueApplicationService()
          .getIssue(company.id, issue_id);
        const issuesResult = await container.getIssueApplicationService().listIssues(company.id);
        if (!issueResult.ok) throw new Error(issueResult.error.message);
        if (!issuesResult.ok) throw new Error(issuesResult.error.message);
        const task = issueResult.value;
        const issues = issuesResult.value;
        const parentTask =
          task.parentId && task.parentId !== task.id
            ? issues.find((issue) => issue.id === task.parentId)
            : undefined;
        const blockerTasks = issues.filter((issue) => issue.parentId === task.parentId);
        const dependentTasks = issues.filter((issue) => issue.parentId === task.id);
        const data = parentTask
          ? { task, parentTask, blockerTasks, dependentTasks }
          : { task, blockerTasks, dependentTasks };
        return createTextResult(selectText(response_format, data, renderTaskDependencies), data);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  // ===== Approvals =====
  server.registerTool(
    "paperclip_list_pending_approvals",
    {
      description: "List pending approvals and decisions.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issues = await client.listPendingApprovals(company.id);
        const page = paginate(issues, limit, offset);
        return presentList(
          "Paperclip pending approvals",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "items",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_approval_request",
    {
      description: "Get details about a specific approval request.",
      inputSchema: issueReadOnlyGetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, issue_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issue = await client.getApprovalRequest(company.id, issue_id);
        return presentDetail(
          `Paperclip approval request: ${issue.title}`,
          issue as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_high_risk_actions",
    {
      description: "List high-risk actions awaiting approval.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const issues = await client.listHighRiskActions(company.id);
        const page = paginate(issues, limit, offset);
        return presentList(
          "Paperclip high risk actions",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "items",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  // ===== Routines =====
  server.registerTool(
    "paperclip_list_routines",
    {
      description: "List active routines in the company.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const routinesResult = await container
          .getRoutineApplicationService()
          .listRoutines(company.id);
        if (!routinesResult.ok) throw new Error(routinesResult.error.message);
        const routines = routinesResult.value;
        const page = paginate(routines, routines.length || 1, 0);
        return presentList(
          "Paperclip routines",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "routines",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_routine",
    {
      description: "Get details about a specific routine.",
      inputSchema: companyReadOnlyGetSchema.extend({ routine_id: z.string() }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, routine_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const routineResult = await container
          .getRoutineApplicationService()
          .getRoutine(company.id, routine_id);
        if (!routineResult.ok) throw new Error(routineResult.error.message);
        const routine = routineResult.value;
        return presentDetail(
          `Paperclip routine: ${routine.name}`,
          routine as unknown as Record<string, unknown>,
          response_format,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_routine_runs",
    {
      description: "List runs of a specific routine.",
      inputSchema: companyReadOnlyListSchema.extend({ routine_id: z.string() }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, routine_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const runsResult = await container
          .getRoutineApplicationService()
          .listRoutineRuns(company.id, routine_id);
        if (!runsResult.ok) throw new Error(runsResult.error.message);
        const runs = runsResult.value;
        const page = paginate(runs, limit, offset);
        return createTextResult(selectText(response_format, page.items, renderRoutineRuns), page);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_routine_run",
    {
      description: "Get details about a specific routine run.",
      inputSchema: companyReadOnlyGetSchema.extend({ run_id: z.string() }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, run_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const runResult = await container
          .getRoutineApplicationService()
          .getRoutineRun(company.id, run_id);
        if (!runResult.ok) throw new Error(runResult.error.message);
        const run = runResult.value;
        return createTextResult(selectText(response_format, run, renderRoutineRun), run);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_list_failed_routine_runs",
    {
      description: "List failed routine runs.",
      inputSchema: companyReadOnlyListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, limit = 20, offset = 0, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const runsResult = await container
          .getRoutineApplicationService()
          .listFailedRoutineRuns(company.id);
        if (!runsResult.ok) throw new Error(runsResult.error.message);
        const runs = runsResult.value;
        const page = paginate(runs, limit, offset);
        return presentList(
          "Paperclip failed routine runs",
          page.items as unknown as Array<Record<string, unknown>>,
          page,
          response_format,
          "items",
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

  server.registerTool(
    "paperclip_get_routine_schedule",
    {
      description: "Get the schedule for a routine.",
      inputSchema: companyReadOnlyGetSchema.extend({ routine_id: z.string() }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ company_id, routine_id, response_format = "markdown" }) => {
      try {
        const company = await resolveCompany(container, company_id);
        const scheduleResult = await container
          .getRoutineApplicationService()
          .getRoutineSchedule(company.id, routine_id);
        if (!scheduleResult.ok) throw new Error(scheduleResult.error.message);
        const schedule = scheduleResult.value;
        return createTextResult(
          selectText(response_format, schedule, renderRoutineSchedule),
          schedule,
        );
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );
}
