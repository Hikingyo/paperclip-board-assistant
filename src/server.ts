import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import type { RuntimeConfig } from "./config.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { PaperclipClient } from "./services/paperclip-client.js";
import { registerPaperclipTools } from "./tools/paperclip-tools.js";

export function createPaperclipServer(config: RuntimeConfig): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerPaperclipTools(server, new PaperclipClient(config.paperclipBaseUrl));

  return server;
}
