# Architecture

## Repository layout

This repository is now structured as a publishable Copilot plugin workspace with three explicit bricks:

1. **MCP**
   - `packages/mcp`
   - the executable MCP runtime that talks to Paperclip over stdio

2. **Agent**
   - `copilot/agent`
   - Copilot-side assistant metadata and instructions

3. **Skills**
   - `copilot/skills`
   - prompt-backed skills that orchestrate the MCP surface

The publishable bundle inventory lives in:

- `marketplace/plugin-bundle.json`
- `scripts/package-plugin.mjs`

## Current runtime architecture

This project is a **TypeScript MCP server** that speaks **stdio** and delegates all business data access to a local PaperclipAI HTTP API.

### Layers

1. **Runtime bootstrap**
   - `packages/mcp/src/index.ts`
   - loads runtime config
   - creates the MCP server
   - connects stdio transport

2. **Server assembly**
   - `packages/mcp/src/server.ts`
   - constructs `McpServer`
   - wires the `ServiceContainer` into tool registrars

3. **Configuration**
   - `packages/mcp/src/config.ts`
   - validates environment variables
   - normalizes the target Paperclip base URL

4. **API boundary**
   - `packages/mcp/src/shared/api/client.ts`
   - centralized HTTP boundary used by repositories and transitional read-only tool gateway logic

5. **Tool surface**
   - `packages/mcp/src/tools/paperclip-tools.ts`
   - registers MCP tools
   - depends on shared schemas, helpers, and renderers

6. **Shared tool utilities**
   - `packages/mcp/src/tools/paperclip-tool-helpers.ts`
   - result helpers, pagination, response selection, and error shaping
- `packages/mcp/src/tools/paperclip-renderers.ts`
  - markdown renderers for Paperclip resources
- `packages/mcp/src/tools/paperclip-company-insights.ts`
  - shared derived company visibility and workflow views such as board summary, execution summary, metrics, and policies

7. **Contracts**
   - `packages/mcp/src/types.ts`
   - `packages/mcp/src/schemas.ts`

## Why this structure

The architecture is intentionally split so the project can grow in three directions without collapsing into one large tool file:

- more Paperclip resource families
- more board assistant workflow tools
- future setup/restructuring wizard features
- publishable Copilot agent and skills assets alongside the MCP runtime

## Product expansion model

The long-term product is layered:

1. **MCP primitives**
   - read/write tools for Paperclip resources

2. **Workflow layer**
   - board summaries
   - risk analysis
   - reprioritization helpers
   - wizard flows

3. **Copilot experience layer**
   - skills
   - assistant personas
   - setup/restructuring orchestration

## Packaging convention

The repository keeps source artifacts separate from the staged publishable bundle:

1. source artifacts live in `packages/mcp`, `copilot/agent`, and `copilot/skills`
2. `marketplace/plugin-bundle.json` declares the publishable inventory
3. `npm run package:plugin` stages a release-ready bundle under `dist/marketplace/`

## Direction on agents

Some agents belong **inside Paperclip companies** and act as members of the operating team.

Copilot-side automation should focus on:

- company setup
- restructuring
- supervision
- board decision support
- workflow orchestration

That separation matters for future design: internal company agents are part of the target system, while Copilot assistants are part of the operator experience around the system.
