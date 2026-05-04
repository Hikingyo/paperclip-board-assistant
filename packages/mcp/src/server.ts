import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { RuntimeConfig } from "./config.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { PaperclipApiClient } from "./shared/api/client.js";
import { ServiceContainer } from "./shared/container.js";
import { registerPaperclipTools } from "./tools/paperclip-tools.js";

export function createPaperclipServer(config: RuntimeConfig): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const apiClient = new PaperclipApiClient(config.paperclipBaseUrl);
  const container = new ServiceContainer(apiClient);
  registerPaperclipTools(server, container);

  return server;
}
