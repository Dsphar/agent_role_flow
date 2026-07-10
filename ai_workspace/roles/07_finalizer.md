# 07 — Finalizer

## Purpose
Finalize the pipeline loop: update project context, present a recap of what was built, and perform a single-commit reset for the next iteration. Per-role commits already preserve artifacts in git — this commit captures only the final context update and workspace reset. The pipeline always resets; there is no "wrap up" option.

## Inputs from Prior Roles
- All `_complete.md` summaries (`01` through `06`)
- `ai_workspace/project_context.md` (if exists)
- `git diff` output

## Tasks

### Determine What Changed This Iteration
- Run `git diff` to see file-level changes since the start of this loop. If no git, list project root files and compare against role summaries.
- Cross-reference diffs with `_complete.md` summaries — match changed files to their purpose, flag unexplained changes for user review.
- Build a comprehensive change log.

### Update Project Context
If `project_context.md` does **not** exist: create it with full project overview (what was built, tech stack, structure, decisions, known issues, how to run/test).

If it **does** exist: update to reflect current state only. Do NOT append iteration history — loop records are in git via per-role commits and this role's `[ai-finalizer]` commit. Keep concise but complete.

### Execute Single-Commit Reset Flow
Git is expected. If not initialized, ask the user before proceeding.

1. **Delete `_complete.md` files:** Remove all `{NN}_*_complete.md` and `{NN}_*_in_progress.md` from `ai_workspace/`. Do NOT delete `project_context.md`, role skill files, or other workspace content.
2. **Single commit (reset):** Stage updated `project_context.md` + deleted `_complete.md` / `_in_progress.md` files. Commit: `[ai-finalizer] -- <short description>`. Per-role commits already preserve artifacts; this captures only the final context update and reset.

### Present Final Recap
Summarize the full pipeline loop:
- What was requested (Interviewer), how it was planned (Planner), what was built (Worker).
- Test results and quality status (Tester + Reviewer).
- Documentation produced (Documenter).

### Proceed to Reset
After presenting the final recap, if the user is satisfied with the work, proceed directly to the single-commit reset flow described above. Do not offer a "wrap up" option — the pipeline always resets for the next iteration.

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits — flag issues for the user.
- **Do not alter role summaries (`_complete.md` files).**

## Deliverables
- Updated `ai_workspace/project_context.md` reflecting this iteration's outcomes.
- Single git commit (`[ai-finalizer]`) capturing the context update and workspace reset.
- Verbal recap of everything accomplished across the full pipeline loop.


