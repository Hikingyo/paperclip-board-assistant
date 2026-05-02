# Architecture

## Current runtime architecture

This project is a **TypeScript MCP server** that speaks **stdio** and delegates all business data access to a local PaperclipAI HTTP API.

### Layers

1. **Runtime bootstrap**
   - `src/index.ts`
   - loads runtime config
   - creates the MCP server
   - connects stdio transport

2. **Server assembly**
   - `src/server.ts`
   - constructs `McpServer`
   - wires the Paperclip client into tool registrars

3. **Configuration**
   - `src/config.ts`
   - validates environment variables
   - normalizes the target Paperclip base URL

4. **API boundary**
   - `src/services/paperclip-client.ts`
   - the only module that performs direct HTTP requests to Paperclip

5. **Tool surface**
   - `src/tools/paperclip-tools.ts`
   - registers MCP tools
   - depends on shared schemas, helpers, and renderers

6. **Shared tool utilities**
   - `src/tools/paperclip-tool-helpers.ts`
   - result helpers, pagination, response selection, and error shaping
   - `src/tools/paperclip-renderers.ts`
   - markdown renderers for Paperclip resources

7. **Contracts**
   - `src/types.ts`
   - `src/schemas.ts`

## Why this structure

The architecture is intentionally split so the project can grow in three directions without collapsing into one large tool file:

- more Paperclip resource families
- more board assistant workflow tools
- future setup/restructuring wizard features

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

## Direction on agents

Some agents belong **inside Paperclip companies** and act as members of the operating team.

Copilot-side automation should focus on:

- company setup
- restructuring
- supervision
- board decision support
- workflow orchestration

That separation matters for future design: internal company agents are part of the target system, while Copilot assistants are part of the operator experience around the system.
