import { DEFAULT_BASE_URL } from "../constants.js";
import type {
  PaperclipAdapter,
  PaperclipAgent,
  PaperclipCompany,
  PaperclipHealth,
  PaperclipPlugin,
  PaperclipProfile,
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
