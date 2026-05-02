---
name: delivery-ritual
description: "Run the repository delivery ritual: checks, commit, push, and pull request creation."
argument-hint: Optional scope or PR focus, for example "MCP tools" or "docs only".
---

Run the repository delivery ritual for the current work:

1. Confirm the branch and base branch fit the repository Git Flow model.
2. Inspect the worktree and call out any unrelated or generated changes that should not be included.
3. Run the relevant repository checks for the current scope before creating the commit.
4. Create a Conventional Commit message with the required Copilot co-author trailer.
5. Push the branch to origin.
6. Open or update the pull request against the correct base branch with a concise summary and testing notes.

Return the commit SHA, branch name, and pull request URL.
