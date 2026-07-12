# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### W1: git log --oneline truncation can break Finalizer subject-line matching (captured by Reviewer, 2026-07-10)
- `07_finalizer.md` steps 4 and "Determine What Changed" use `git log --oneline`, which truncates each line to ~52 characters. If a goal summary exceeds ~40 chars, prefix matching against the full summary from step 1 will fail.
- Fix: Use `git log --format="%H %s"` for full subject lines, or add guidance keeping summaries under 40 chars.

### W5: Create a "todo" skill helper (captured by Interviewer, 2026-07-12)
- A support/skill-assist file that helps agents manage the `todo.md` workflow — capturing items, presenting pending options, tracking completion.

### W4: Add "project initializer" support skill to build initial project_context.md (captured by Interviewer, 2026-07-12)
- New support skill (to live in the future skill-assist folder) that builds the initial `project_context.md`.
- `AGENTS.md` should invoke this skill when no `project_context.md` exists at all.
- **If existing project files are found:** auto-scan workspace folders, step through relevant children/files, summarize each project and how they work together. Present report to user for corrections/clarifications/expansions before creating the file.
- **If no project files found:** assume structure is undecided. Interview the user (with follow-ups) on top-level goals, then narrow into specific tech stacks via further questions until the full picture is clear. Present complete summary to user for input before creating `project_context.md`.

### W2: project_context.md still references "per-role commits" model (captured by Reviewer, 2026-07-10)
- `ai_workspace/project_context.md` under "Key Design Decisions" and the bottom loop-history note still describe per-role commits as the git record. After squash, only one `[ai-finalizer]` commit exists per loop.
- Fix: Update to reflect the squashed-commit model.




