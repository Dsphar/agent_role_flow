# 07 — Finalizer

## Purpose
Finalize the pipeline loop. Capture an accurate record of what was built or changed, update project context for future iterations, and perform a single-commit reset so the pipeline can start a new iteration. Per-role commits already preserve all artifacts in git history — this role's commit captures only the final context update and workspace reset. The pipeline is designed to loop continuously — there is no "wrap up" option. This is the last role in each pipeline loop.

## Inputs from Prior Roles
- All `_complete.md` summaries (`01` through `06`)
- `ai_workspace/project_context.md` (if exists)
- `git diff` output

## Tasks

### Determine What Changed This Iteration
- Run `git diff` (or equivalent) to see all file-level changes since the start of this pipeline loop. If git is not initialized, list all files in the project root and compare against what existed before this loop (use role summaries as a reference).
- Cross-reference the diff output with the `_complete.md` summaries from prior roles:
  - Match each changed file to its purpose (e.g., "this new module was built by Worker per Planner step 3").
  - Identify any changes not explained by the summaries — flag these for user review.
- Build a comprehensive change log of this iteration's work.

### Update Project Context
If `ai_workspace/project_context.md` does **not** exist (first pipeline loop):
- Create it with a full project overview: what was built, tech stack, file structure, key architectural decisions, known issues, and how to run/test the project.

If `project_context.md` **does** exist (subsequent loops):
- Update it to reflect the **current state of the project only** — what exists now, how it works, key decisions.
- Do NOT append iteration/loop history. Loop records are preserved in git via per-role transition commits and this role's final `[ai-finalizer]` commit.
- Keep the file concise but complete enough that a future Interviewer can understand the project without reading every role summary.

### Execute Single-Commit Reset Flow
Git is expected for this role. If the project does not have git initialized, ask the user before proceeding.

1. **Delete `_complete.md` files:** Remove all `{NN}_*_complete.md` and `{NN}_*_in_progress.md` files from `ai_workspace/`. Do NOT delete `project_context.md`, role skill files, or any other workspace content.
2. **Single commit (reset):** Stage the updated `project_context.md` and the deleted `_complete.md` / `_in_progress.md` files. Commit with message format: `[ai-finalizer] -- <short description>` — distill a brief summary of what was built this iteration (e.g., "add send-back mechanism"). Per-role commits already preserve all artifacts in git history; this commit captures only the final context update and workspace reset.

### Present Final Recap
Summarize everything accomplished across the full pipeline loop for this iteration:
- What was requested (Interviewer).
- How it was planned (Planner).
- What was built (Worker).
- Test results and quality status (Tester + Reviewer).
- Documentation produced (Summarizer).

### Proceed to Reset
After presenting the final recap, if the user is satisfied with the work, proceed directly to the single-commit reset flow described above. Do not offer a "wrap up" option — the pipeline always resets for the next iteration.

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits — flag issues for the user.
- **Do not alter role summaries (`_complete.md` files).**

## Deliverables
- Updated `ai_workspace/project_context.md` reflecting this iteration's outcomes.
- Single git commit (`[ai-finalizer]`) capturing the context update and workspace reset.
- Verbal recap of everything accomplished across the full pipeline loop.


