import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  agentReadOnlyGetSchema,
  companyReadOnlyGetSchema,
  companyReadOnlyListSchema,
  issueReadOnlyGetSchema,
  projectReadOnlyGetSchema,
  readOnlyGetSchema,
  readOnlyListSchema,
} from "../schemas.js";
import type { PaperclipClient } from "../services/paperclip-client.js";
import type { PaginatedResult, PaperclipAgent, PaperclipIssue } from "../types.js";
import {
  buildCompanyActivityFeed,
  buildCompanyBoardSummary,
  buildCompanyExecutionSummary,
  buildCompanyMetrics,
  buildCompanyPolicies,
} from "./paperclip-company-insights.js";
import {
  renderAdapters,
  renderAgent,
  renderAgentCapabilities,
  renderAgentRecentActivity,
  renderAgentStatus,
  renderAgents,
  renderAgentWorkload,
  renderApprovalRequest,
  renderBlockedTasks,
  renderCompanies,
  renderCompany,
  renderCompanyActivityFeed,
  renderCompanyBoardSummary,
  renderCompanyExecutionSummary,
  renderCompanyMetrics,
  renderCompanyPolicies,
  renderFailedRoutineRuns,
  renderHealth,
  renderHighRiskActions,
  renderIssue,
  renderIssues,
  renderOverdueTasks,
  renderPendingApprovals,
  renderPlugins,
  renderProfile,
  renderProject,
  renderProjectRisks,
  renderProjectStatus,
  renderProjects,
  renderProjectTasks,
  renderRoutine,
  renderRoutineRun,
  renderRoutineRuns,
  renderRoutineSchedule,
  renderRoutines,
  renderSession,
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

async function resolveCompany(
  client: PaperclipClient,
  companyId?: string,
): Promise<Awaited<ReturnType<PaperclipClient["listCompanies"]>>[number]> {
  const companies = await client.listCompanies();

  return resolveRequestedItem(companies, {
    itemId: companyId,
    resourceName: "company",
    resourceNamePlural: "companies",
    idFieldName: "company_id",
  });
}

export function registerPaperclipTools(server: McpServer, client: PaperclipClient): void {
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
        return createTextResult(selectText(response_format, health, renderHealth), health);
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
        return createTextResult(selectText(response_format, session, renderSession), session);
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
        return createTextResult(selectText(response_format, profile, renderProfile), profile);
      } catch (error) {
        return createErrorResult(error);
      }
    },
  );

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
        const companies = await client.listCompanies();
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
        const company = await resolveCompany(client, companyId);
        return createTextResult(selectText(response_format, company, renderCompany), company);
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
        const company = await resolveCompany(client, companyId);
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
        const company = await resolveCompany(client, companyId);
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
        const company = await resolveCompany(client, companyId);
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
        const company = await resolveCompany(client, companyId);
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
        const companies = await client.listCompanies();
        const page = paginate(companies, limit, offset);
        const structured = { ...page, companies: page.items };
        return createTextResult(
          selectText(response_format, structured, renderCompanies),
          structured,
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
        const structured = { ...page, adapters: page.items };
        return createTextResult(
          selectText(response_format, structured, renderAdapters),
          structured,
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
        const structured = { ...page, plugins: page.items };
        return createTextResult(selectText(response_format, structured, renderPlugins), structured);
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
        const company = await resolveCompany(client, company_id);
        const agents = await client.getCompanyAgents(company.id);
        const page = paginate(agents, limit, offset);
        const structured = { ...page, agents: page.items };
        return createTextResult(selectText(response_format, structured, renderAgents), structured);
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
        const company = await resolveCompany(client, company_id);
        const agent = await client.getCompanyAgent(company.id, agent_id);
        return createTextResult(selectText(response_format, agent, renderAgent), agent);
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
        const company = await resolveCompany(client, company_id);
        const projects = await client.getCompanyProjects(company.id);
        const page = paginate(projects, limit, offset);
        const structured = { ...page, projects: page.items };
        return createTextResult(
          selectText(response_format, structured, renderProjects),
          structured,
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
        const company = await resolveCompany(client, company_id);
        const project = await client.getCompanyProject(company.id, project_id);
        return createTextResult(selectText(response_format, project, renderProject), project);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.getCompanyIssues(company.id);
        const page = paginate(issues, limit, offset);
        const structured = { ...page, issues: page.items };
        return createTextResult(selectText(response_format, structured, renderIssues), structured);
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
        const company = await resolveCompany(client, company_id);
        const issue = await client.getCompanyIssue(company.id, issue_id);
        return createTextResult(selectText(response_format, issue, renderIssue), issue);
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
        const company = await resolveCompany(client, company_id);
        const agent = await client.getAgentStatus(company.id, agent_id);
        return createTextResult(selectText(response_format, agent, renderAgentStatus), agent);
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
        const company = await resolveCompany(client, company_id);
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
        const company = await resolveCompany(client, company_id);
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
        const company = await resolveCompany(client, company_id);
        const agent = await client.getAgentCapabilities(company.id, agent_id);
        return createTextResult(selectText(response_format, agent, renderAgentCapabilities), agent);
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
        const company = await resolveCompany(client, company_id);
        const data = await client.getProjectStatus(company.id, project_id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.getProjectRisks(company.id, project_id);
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
        const company = await resolveCompany(client, company_id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listProjectTasks(company.id, project_id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listBlockedTasks(company.id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listOverdueTasks(company.id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listUnassignedTasks(company.id);
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
        const company = await resolveCompany(client, company_id);
        const data = await client.getTaskDependencies(company.id, issue_id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listPendingApprovals(company.id);
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderPendingApprovals), page);
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
        const company = await resolveCompany(client, company_id);
        const issue = await client.getApprovalRequest(company.id, issue_id);
        return createTextResult(selectText(response_format, issue, renderApprovalRequest), issue);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listHighRiskActions(company.id);
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderHighRiskActions), page);
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
        const company = await resolveCompany(client, company_id);
        const routines = await client.listRoutines(company.id);
        return createTextResult(selectText(response_format, routines, renderRoutines), {
          routines,
          total: routines.length,
        });
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
        const company = await resolveCompany(client, company_id);
        const routine = await client.getRoutine(company.id, routine_id);
        return createTextResult(selectText(response_format, routine, renderRoutine), routine);
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
        const company = await resolveCompany(client, company_id);
        const runs = await client.listRoutineRuns(company.id, routine_id);
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
        const company = await resolveCompany(client, company_id);
        const run = await client.getRoutineRun(company.id, run_id);
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
        const company = await resolveCompany(client, company_id);
        const issues = await client.listFailedRoutineRuns(company.id);
        const page = paginate(issues, limit, offset);
        return createTextResult(selectText(response_format, page, renderFailedRoutineRuns), page);
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
        const company = await resolveCompany(client, company_id);
        const schedule = await client.getRoutineSchedule(company.id, routine_id);
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
