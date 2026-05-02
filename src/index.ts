#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getRuntimeConfig } from "./config.js";
import { createPaperclipServer } from "./server.js";

async function main(): Promise<void> {
  const config = getRuntimeConfig();
  const server = createPaperclipServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start Paperclip MCP server:", error);
  process.exit(1);
});
