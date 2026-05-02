# Delivery ritual

Use this skill when the user asks for the repository delivery ritual: prepare the branch, run the relevant checks, create the commit, push it, and open the pull request.

## Workflow

1. Confirm the current branch strategy fits the repository Git Flow model.
2. Inspect the worktree and make sure generated artifacts or unrelated changes do not pollute the delivery.
3. Run the relevant repository checks for the current scope before creating the commit.
4. Create a Conventional Commit message with the required Copilot co-author trailer.
5. Push the branch to origin.
6. Open the pull request against the correct base branch with a concise summary and testing notes.

## Output

Return the commit SHA, branch name, and pull request URL.
