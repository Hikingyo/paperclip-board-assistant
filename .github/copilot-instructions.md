# Copilot Instructions

## Build, run, and inspection commands

- Load the project Node version: `nvm use` (the repo uses `.nvmrc` with `lts/*`)
- Install dependencies: `npm install`
- Start watch mode during development: `npm run dev`
- Build the server: `npm run build`
- Run type checks: `npm run typecheck`
- Run the linter: `npm run lint`
- Run the last-commit conventional commit check: `npm run lint:commits:last`
- Run format checks: `npm run format:check`
- Format the repo: `npm run format`
- Run tests: `npm run test`
- Run the CI-equivalent local gate: `npm run ci`
- Generate the changelog: `npm run changelog`
- Preview unreleased changelog entries: `npm run changelog:unreleased`
- Preview release notes for the current tag: `npm run release:notes:current`
- Run the full quality gate: `npm run check`
- Install local Git hooks: `npm run prepare` (also runs automatically after `npm install`)
- Start the MCP server over stdio: `npm start`
- Open it in MCP Inspector: `npm run inspector`

There is no single-test script yet; use `vitest` conventions if one is added later rather than inventing a custom command.

## High-level architecture

- This repository hosts a **TypeScript MCP server** for a local PaperclipAI instance, using the MCP SDK over **stdio**.
- `src/index.ts` is the single entrypoint: it builds the `McpServer`, reads `PAPERCLIP_BASE_URL`, registers tools, and connects the stdio transport. This repo does **not** expose MCP over HTTP.
- `src/config.ts` validates runtime configuration and normalizes the target Paperclip base URL before anything is wired up.
- `src/server.ts` assembles the MCP server and is the place to keep future tool-family registration composition.
- `src/services/paperclip-client.ts` is the shared HTTP layer for Paperclip endpoints. It normalizes the base URL, always requests JSON, and raises `PaperclipApiError` for both HTTP failures and non-JSON responses.
- `src/tools/paperclip-tools.ts` owns the current Paperclip tool registration layer.
- `src/tools/paperclip-tool-helpers.ts` and `src/tools/paperclip-renderers.ts` hold reusable result-shaping, pagination, and markdown rendering logic; prefer extending those instead of growing one monolithic tool file.
- `src/schemas.ts` centralizes reusable Zod input schemas for read-only tools.
- `src/types.ts` holds the Paperclip response shapes inferred from the live local instance and keeps them compatible with MCP `structuredContent`.
- `src/constants.ts` is the shared source of truth for the default Paperclip base URL and MCP server identity.
- `docs/architecture.md` explains the current code layering and intended extension points.
- `docs/board-assistant-roadmap.md` is the planning reference for the long-term product direction: board assistant workflows, routines, setup/restructuring wizards, and the split between Paperclip-side agents and Copilot-side assistants.

The current tool surface is intentionally read-only and maps to endpoints already confirmed against a local PaperclipAI server: `/api/health`, `/api/auth/get-session`, `/api/auth/profile`, `/api/companies`, `/api/adapters`, and `/api/plugins`.

## Key conventions

- Default to `PAPERCLIP_BASE_URL=http://127.0.0.1:3100` and keep it configurable via environment variable rather than hardcoding other hosts.
- Use the repo-local Node version from `.nvmrc` before running project commands; `.nvmrc` intentionally tracks the latest Node LTS via `lts/*`.
- Copy `.env.example` to `.env` when you need to override the default local Paperclip target.
- Prefer **service-prefixed snake_case tool names** such as `paperclip_get_health` and `paperclip_list_companies`.
- Keep Paperclip endpoint access inside `PaperclipClient`; tool handlers should compose client calls and presentation logic rather than calling `fetch` directly.
- Each tool should support `response_format` so callers can choose markdown for human-readable output or json for structured output, while still returning `structuredContent` for machine-readable clients.
- For list-style endpoints, keep pagination behavior in the MCP layer (`limit`, `offset`, `has_more`, `next_offset`) even when the upstream endpoint returns a full array.
- Follow the existing split between `readOnlyGetSchema` and `readOnlyListSchema` when adding tools, instead of defining ad hoc input schemas for the same patterns.
- New Paperclip resources should get a dedicated markdown renderer in `src/tools/paperclip-renderers.ts` so markdown and JSON output stay aligned.
- Shared helper logic belongs in dedicated modules and should be covered by tests under `test/`.
- Return actionable tool errors that mention the Paperclip base URL and whether the endpoint failed or returned non-JSON; do not swallow upstream failures.
- Keep write tools, routines control, and wizard flows behind explicit guardrails once they land.
- When adding major new tool families, keep `docs/board-assistant-roadmap.md` and `docs/architecture.md` in sync with what has shipped and what remains planned.
- The repository uses a lightweight Git Flow model: `main` is the stable branch, `develop` is the integration branch, and feature branches should start from `develop`.
- Husky hooks are part of the contributor workflow: pre-commit checks formatting and linting, commit-msg enforces Conventional Commits, and pre-push runs the test suite.
- Release notes are generated with `git-cliff`, configured in `cliff.toml`, so semantic commit history is now part of the repository contract.
- GitHub release automation is split into two workflows: `release-prepare.yml` prepares a release branch from `develop`, and `release-publish.yml` publishes a tagged GitHub Release from `main`.
