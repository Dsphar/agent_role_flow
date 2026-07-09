# 02 — Planner In Progress

## Plan: Git Commits at Every Pipeline Stage

### Architecture Overview

No new files or code are needed. The change is purely **instructional** — we update `AGENTS.md` so that every role, during its transition step, performs a git commit of all changed work. Since AGENTS.md is read on every session start and governs all roles, a single edit propagates the behavior pipeline-wide.

### Key Decisions
- **`git add -A`** — stages everything including untracked files (respects `.gitignore`).
- **Block transition on failure** — if git fails (no repo, no identity configured, etc.), the role cannot complete until the user resolves it.
- **Send-back detection** — check for `send_back_to_worker.md` at transition time to decide whether to use the `-sendback` prefix.
- **Summary extraction** — each role already produces a completion summary; we truncate it to ~100 chars for the commit message.

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `AGENTS.md` | Modify | Add git commit step in "Transitioning Between Roles" section |
| `ai_workspace/todo.md` | Modify | Remove completed TODO "Git Commits at Every Pipeline Stage", add new TODO for Finalizer review |

### Ordered Implementation Steps

1. **Update AGENTS.md — Transition Section**
   - After the step where `_complete.md` is saved (or `_in_progress.md` renamed), insert a new git commit step.
   - The step instructs the role to:
     1. Run `git status` to verify a repo exists and there are changes.
     2. If no repo or no changes, skip the commit silently (no error).
     3. Determine send-back context: if `ai_workspace/send_back_to_worker.md` exists, use `[ai-{role-name}-sendback]` prefix; otherwise use `[ai-{role-name}]`.
     4. Run `git add -A`.
     5. Run `git commit -m "[ai-{role-name}] {up to 100 char summary}"`.
     6. If the commit fails for any reason (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.

2. **Update ai_workspace/todo.md**
   - Remove the completed TODO item "Git Commits at Every Pipeline Stage".
   - Add a new TODO: "Review Finalizer flow after per-role commits" — noting that with incremental commits now happening at every stage, the Finalizer's commit/summary behavior may need adjustment (e.g., avoiding duplicate commits, adjusting its recap to reference existing per-role commits).

### Risks and Open Questions
- **Role name extraction:** The role number+name is derivable from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`). This should be straightforward.
- **Large diffs:** If a role produces many files, `git add -A` could stage unrelated changes the user made manually. Mitigation: `.gitignore` handles build artifacts; the "block on failure" policy lets the user intervene if needed.
- **Finalizer interaction (deferred):** The Finalizer currently may do its own commit. After this change, that behavior should be reviewed — captured as a new TODO item for a future loop.
