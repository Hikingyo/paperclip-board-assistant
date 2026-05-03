import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { RuntimeConfig } from "./config.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { PaperclipClient } from "./services/paperclip-client.js";
import { PaperclipApiClient } from "./shared/api/client.js";
import { ServiceContainer } from "./shared/container.js";
import { registerPaperclipTools } from "./tools/paperclip-tools.js";

export function createPaperclipServer(config: RuntimeConfig): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const client = new PaperclipClient(config.paperclipBaseUrl);
  const apiClient = new PaperclipApiClient(config.paperclipBaseUrl);
  const container = new ServiceContainer(apiClient);
  registerPaperclipTools(server, client, container);

  return server;
}
