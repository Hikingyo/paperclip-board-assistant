# Contributing

## Prerequisites

- `nvm use`
- `npm install`
- `cp .env.example .env`
- a local PaperclipAI instance available at `http://127.0.0.1:3100`, or set `PAPERCLIP_BASE_URL`

`npm install` installs the local Husky hooks automatically.

## Development workflow

```bash
npm run dev
```

Useful commands:

- `npm run build`
- `npm run ci`
- `npm run changelog`
- `npm run changelog:unreleased`
- `npm run release:notes:current`
- `npm run typecheck`
- `npm run lint:commits:last`
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

## Local quality gates

- `pre-commit`: `npm run format:check && npm run lint`
- `commit-msg`: `commitlint`
- `pre-push`: `npm run test`

If a hook fails, fix the issue locally before retrying the commit or push.

## Commit convention

Use Conventional Commits for every commit message:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `build:`
- `ci:`
- `chore:`

Examples:

- `feat(mcp): add board daily brief tool`
- `fix(client): include response body in API errors`
- `docs(readme): clarify local Paperclip setup`

## Changelog workflow

- `npm run changelog` updates `CHANGELOG.md` using `git-cliff`
- `npm run changelog:unreleased` previews unreleased entries only
- `npm run release:notes:current` renders the notes for the currently tagged release
- keep commit messages clean, because releases now depend on semantic commit history

## Release workflow

1. merge completed feature work into `develop`
2. run the **Prepare Release** workflow to create a `release/vX.Y.Z` branch and PR into `main`
3. review and merge that release PR into `main`
4. run the **Publish Release** workflow from `main` to create the tag, GitHub Release, and packaged artifact
5. merge `main` back into `develop` to keep Git Flow aligned

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

## Governance references

- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/CODEOWNERS`
