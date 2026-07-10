# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### W1: git log --oneline truncation can break Finalizer subject-line matching (captured by Reviewer, 2026-07-10)
- `07_finalizer.md` steps 4 and "Determine What Changed" use `git log --oneline`, which truncates each line to ~52 characters. If a goal summary exceeds ~40 chars, prefix matching against the full summary from step 1 will fail.
- Fix: Use `git log --format="%H %s"` for full subject lines, or add guidance keeping summaries under 40 chars.

### W2: project_context.md still references "per-role commits" model (captured by Reviewer, 2026-07-10)
- `ai_workspace/project_context.md` under "Key Design Decisions" and the bottom loop-history note still describe per-role commits as the git record. After squash, only one `[ai-finalizer]` commit exists per loop.
- Fix: Update to reflect the squashed-commit model.




