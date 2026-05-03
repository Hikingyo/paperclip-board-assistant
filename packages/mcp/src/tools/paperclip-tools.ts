import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  agentReadOnlyGetSchema,
  companyReadOnlyGetSchema,
  companyReadOnlyListSchema,
  projectReadOnlyGetSchema,
  readOnlyGetSchema,
  readOnlyListSchema,
} from "../schemas.js";
import type { PaperclipClient } from "../services/paperclip-client.js";
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
  renderAgents,
  renderCompanies,
  renderCompany,
  renderCompanyActivityFeed,
  renderCompanyBoardSummary,
  renderCompanyExecutionSummary,
  renderCompanyMetrics,
  renderCompanyPolicies,
  renderHealth,
  renderPlugins,
  renderProfile,
  renderProject,
  renderProjects,
  renderSession,
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
}
