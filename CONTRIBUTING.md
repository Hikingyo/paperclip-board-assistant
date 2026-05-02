# Contributing

## Prerequisites

- `nvm use`
- `npm install`
- a local PaperclipAI instance available at `http://127.0.0.1:3100`, or set `PAPERCLIP_BASE_URL`

## Development workflow

```bash
npm run dev
```

Useful commands:

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run format:check`
- `npm run test`
- `npm run check`

## Git workflow

This repository follows a lightweight Git Flow setup:

- `main`: stable baseline and release history
- `develop`: integration branch for upcoming work
- `feature/<name>`: feature branches created from `develop`
- `hotfix/<name>`: urgent fixes created from `main`
- `release/<name>`: optional release-preparation branches created from `develop`

Preferred flow:

1. branch from `develop`
2. run `npm run check` before opening a PR
3. merge features back into `develop`
4. merge `develop` into `main` for stable releases

## Architecture rules

- Keep all Paperclip HTTP calls in `src/services/paperclip-client.ts`.
- Keep MCP tool registration and response shaping in `src/tools/`.
- Prefer reusable schemas and render helpers over duplicating inline logic in tool handlers.
- Preserve `response_format`, markdown output, JSON output, and `structuredContent` for all user-facing tools.
- Add tests for any new configuration parsing, rendering logic, pagination logic, or client behavior.

## Documentation rules

When adding a new tool family or major product capability:

- update `README.md`
- update `.github/copilot-instructions.md` when architecture or conventions evolve
- update `docs/board-assistant-roadmap.md`
- update `docs/architecture.md` if new modules or layers are introduced
