# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### Fix Scope Deviation in transition_guide.md — Extra First-Person Change (captured by Reviewer, 2026-07-10)
- `ai_workspace/roles/transition_guide.md` line ~21: "skip this step silently" was changed to "**I** skip this step silently" during the imperative-shell-command rewrite loop.
- This was not one of the planned changes — scope said only shell command lines should change, general prose stays second-person.
- Revert "I skip" back to "skip" (second-person) to match original minimal-diff intent.

### Fix Pipeline Diagram in transition_guide.md (captured by user, 2026-07-10)
- The pipeline diagram in `ai_workspace/roles/transition_guide.md` is inaccurate and needs to be corrected.

### Fix Sendback Commit Messages to Use Shared Summary from interviewer_complete (captured by user, 2026-07-10)
- Several sendback commit messages failed to use the shared `## Goal Summary` from `01_interviewer_complete.md` as their subject line.
- Ensure that send-back commits follow the same convention: tag appended at end of commit message as `[ai-{role-name}-sendback]`, with the goal summary from the Interviewer used as the base subject.

### W1: git log --oneline truncation can break Finalizer subject-line matching (captured by Reviewer, 2026-07-10)
- `07_finalizer.md` steps 4 and "Determine What Changed" use `git log --oneline`, which truncates each line to ~52 characters. If a goal summary exceeds ~40 chars, prefix matching against the full summary from step 1 will fail.
- Fix: Use `git log --format="%H %s"` for full subject lines, or add guidance keeping summaries under 40 chars.

### W2: project_context.md still references "per-role commits" model (captured by Reviewer, 2026-07-10)
- `ai_workspace/project_context.md` under "Key Design Decisions" and the bottom loop-history note still describe per-role commits as the git record. After squash, only one `[ai-finalizer]` commit exists per loop.
- Fix: Update to reflect the squashed-commit model.




