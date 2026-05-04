# paperclip-board-assistant

Workspace for a publishable Copilot plugin around PaperclipAI, designed to grow into a **board assistant** and onboarding / restructuring companion for Paperclip companies.

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
npm install
cp packages/mcp/.env.example .env
```

## Development

```bash
npm run dev
```

`npm install` also installs local Husky hooks so formatting, linting, and tests fail earlier in contributor workflows.

## Plugin workspace layout

- `packages/mcp`: the MCP runtime package and its tests
- `copilot/agent`: Copilot-side agent metadata and instructions
- `copilot/skills`: publishable skills/prompts layered above the MCP
- `marketplace/plugin-bundle.json`: the plugin bundle inventory used for staging publishable artifacts
- `scripts/package-plugin.mjs`: stages the publishable bundle into `dist/marketplace/`

## Quality commands

```bash
npm run build
npm run typecheck
npm run lint:commits:last
npm run lint
npm run format
npm run format:check
npm run test
npm run ci
npm run check
npm run changelog
npm run changelog:unreleased
npm run release:notes:current
```

## Run the MCP server

```bash
npm start
```

By default, the server uses `PAPERCLIP_BASE_URL=http://127.0.0.1:3100`.

The `.nvmrc` file uses `lts/*` to follow the latest Node.js LTS supported by `nvm`.

Copy `packages/mcp/.env.example` to `.env` when you want to override the default local Paperclip instance URL.

## Environment variables

| Variable             | Default                 | Description                                 |
|----------------------|-------------------------|---------------------------------------------|
| `PAPERCLIP_BASE_URL` | `http://127.0.0.1:3100` | URL de base de l'instance PaperclipAI cible |

## Current tool surface

- `paperclip_get_health`
- `paperclip_get_session`
- `paperclip_get_profile`
- `paperclip_company_execution_summary`
- `paperclip_get_company`
- `paperclip_get_company_activity_feed`
- `paperclip_get_company_board_summary`
- `paperclip_get_company_metrics`
- `paperclip_get_company_policies`
- `paperclip_list_companies`
- `paperclip_list_adapters`
- `paperclip_list_plugins`

`list_*` tools accept `limit`, `offset`, and `response_format`. `paperclip_get_company`, `paperclip_get_company_activity_feed`, `paperclip_get_company_board_summary`, `paperclip_get_company_metrics`, and `paperclip_get_company_policies` also accept an optional `company_id`, and otherwise auto-select the sole visible company. `paperclip_company_execution_summary` is portfolio-wide and summarizes all visible companies.

## Marketplace packaging

```bash
npm run package:plugin
```

This stages a publishable plugin bundle in `dist/marketplace/paperclip-board-assistant/` using `marketplace/plugin-bundle.json` as the source of truth for:

- MCP build output
- agent manifest and instructions
- shipped skills
- required documentation artifacts

## MCP Inspector

```bash
npm run inspector
```

## Architecture

- `packages/mcp/src/index.ts`: stdio bootstrap and process entrypoint
- `packages/mcp/src/config.ts`: runtime config parsing and validation
- `packages/mcp/src/server.ts`: MCP server assembly
- `packages/mcp/src/shared/api/client.ts`: Paperclip HTTP client and API error boundary
- `packages/mcp/src/shared/container.ts`: dependency injection container for application/domain services
- `packages/mcp/src/tools/`: tool registration, insight builders, helpers, and markdown renderers
- `packages/mcp/src/schemas.ts`: shared Zod schemas for the current read-only tools
- `packages/mcp/src/types.ts`: response contracts for the current Paperclip resource surface
- `copilot/agent/`: Copilot-side board assistant definition
- `copilot/skills/`: prompt-backed skills that orchestrate the MCP surface

## Repository standards

- GitHub Actions CI runs `npm run ci` on `master`, `develop`, and pull requests
- commit messages follow Conventional Commits and are linted locally and in CI
- changelog generation uses `git-cliff` and `cliff.toml`
- Dependabot is enabled for npm and GitHub Actions
- issue templates and a pull request template are included
- contribution workflow is documented in `CONTRIBUTING.md`
- the repository uses a lightweight Git Flow model with `master` and `develop`

## Governance

- `CODE_OF_CONDUCT.md`: contributor behavior expectations
- `SECURITY.md`: vulnerability disclosure process
- `.github/CODEOWNERS`: default review ownership
- `LICENSE`: MIT license for open source use and redistribution

## Releases

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `ci:`...)
- Generate or refresh `CHANGELOG.md` with `npm run changelog`
- Preview only unreleased entries with `npm run changelog:unreleased`
- Preview the current tagged release notes with `npm run release:notes:current`
- Run the **Prepare Release** GitHub workflow from `develop` to create a `release/vX.Y.Z` branch and PR into `master`
- After merging the release PR into `master`, run the **Publish Release** GitHub workflow to create the tag, GitHub Release notes, and release artifact

## Roadmap

The detailed board assistant roadmap, including routines, setup/restructuring wizard direction, and the split between Paperclip-side agents and Copilot-side assistants, lives in `docs/board-assistant-roadmap.md`.
