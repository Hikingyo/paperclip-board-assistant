# paperclip-mcp-server

TypeScript MCP server for PaperclipAI, designed to grow into a **board assistant** and onboarding / restructuring companion for Paperclip companies.

The current version covers confirmed read-only Paperclip endpoints:

- `/api/health`
- `/api/auth/get-session`
- `/api/auth/profile`
- `/api/companies`
- `/api/adapters`
- `/api/plugins`

It also derives company-focused visibility tools from `/api/companies` for board-level inspection.

## Product direction

The project is being built in layers:

1. **MCP primitives** for reading and operating Paperclip resources
2. **Board assistant workflows** for visibility, control, and decision support
3. **Wizard experiences** for company setup, project setup, and restructuring
4. **Copilot-side skills and assistants** layered above the MCP

See:

- `docs/architecture.md`
- `docs/board-assistant-roadmap.md`

## Prerequisites

- the latest Node.js LTS via `.nvmrc`
- a PaperclipAI instance available at `http://127.0.0.1:3100`, or override `PAPERCLIP_BASE_URL`

## Installation

```bash
nvm use
npm install
```

## Development

```bash
npm run dev
```

## Quality commands

```bash
npm run build
npm run typecheck
npm run lint
npm run format
npm run format:check
npm run test
npm run check
```

## Run the MCP server

```bash
npm start
```

By default, the server uses `PAPERCLIP_BASE_URL=http://127.0.0.1:3100`.

The `.nvmrc` file uses `lts/*` to follow the latest Node.js LTS supported by `nvm`.

## Environment variables

| Variable             | Default                 | Description                                 |
|----------------------|-------------------------|---------------------------------------------|
| `PAPERCLIP_BASE_URL` | `http://127.0.0.1:3100` | URL de base de l'instance PaperclipAI cible |

## Current tool surface

- `paperclip_get_health`
- `paperclip_get_session`
- `paperclip_get_profile`
- `paperclip_get_company`
- `paperclip_get_company_board_summary`
- `paperclip_list_companies`
- `paperclip_list_adapters`
- `paperclip_list_plugins`

`list_*` tools accept `limit`, `offset`, and `response_format`. `paperclip_get_company` and `paperclip_get_company_board_summary` also accept an optional `company_id`, and otherwise auto-select the sole visible company.

## MCP Inspector

```bash
npm run inspector
```

## Architecture

- `src/index.ts`: stdio bootstrap and process entrypoint
- `src/config.ts`: runtime config parsing and validation
- `src/server.ts`: MCP server assembly
- `src/services/paperclip-client.ts`: Paperclip HTTP client and API error boundary
- `src/tools/`: tool registration, helpers, and markdown renderers
- `src/schemas.ts`: shared Zod schemas for the current read-only tools
- `src/types.ts`: response contracts for the current Paperclip resource surface

## Repository standards

- GitHub Actions CI runs `npm run check`
- Dependabot is enabled for npm and GitHub Actions
- issue templates and a pull request template are included
- contribution workflow is documented in `CONTRIBUTING.md`
- the repository uses a lightweight Git Flow model with `main` and `develop`

## Roadmap

The detailed board assistant roadmap, including routines, setup/restructuring wizard direction, and the split between Paperclip-side agents and Copilot-side assistants, lives in `docs/board-assistant-roadmap.md`.
