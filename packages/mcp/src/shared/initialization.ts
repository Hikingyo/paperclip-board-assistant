import { getRuntimeConfig } from "../config.js";
import { PaperclipApiClient } from "./api/client.js";
import { ServiceContainer } from "./container.js";

const config = getRuntimeConfig();

/**
 * Initialize services for MCP tools
 * Called once during server startup
 */
export async function initializeServices(): Promise<ServiceContainer> {
  const baseUrl = config.paperclipBaseUrl;
  const apiClient = new PaperclipApiClient(baseUrl);

  // Test connectivity
  const health = await apiClient.get("/api/health");
  if (!health.ok) {
    throw new Error(`Failed to connect to Paperclip at ${baseUrl}: ${health.error.message}`);
  }

  return new ServiceContainer(apiClient);
}
