# 07 — Finalizer

## Purpose
Finalize the pipeline loop. Capture an accurate record of what was built or changed, update project context for future iterations, handle version control (commits, tags), and offer the user the option to reset for a new iteration or wrap up entirely. This is the last role in each pipeline loop.

## Inputs from Prior Roles
- **All `_complete.md` summaries (`01` through `06`)** — provide intent and context for *why* changes were made. Read these to understand the story behind the work.
- **`ai_workspace/project_context.md`** (if exists) — current project state that needs to be updated with this iteration's outcomes.
- **`git diff` output** — ground-truth view of what actually changed in the codebase. Use this alongside role summaries to build a complete, accurate picture: *what* changed + *why*.

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
- Do NOT append iteration/loop history. Loop records are preserved in git via this role's summary commits (`[pi-summary]` / `[pi-reset]` tags).
- Keep the file concise but complete enough that a future Interviewer can understand the project without reading every role summary.

### Execute Two-Commit Reset Flow
Git is expected for this role. If the project does not have git initialized, ask the user before proceeding.

1. **First commit (summary):** Stage and commit all `_complete.md` files (`01_` through `07_`) plus the updated `project_context.md`. Message format: `[pi-summary] <short description>` — distill a brief tag from your recap (e.g., "add send-back mechanism"). This preserves the full loop record in git history.
2. **Delete `_complete.md` files:** Remove all `{NN}_*_complete.md` and `{NN}_*_in_progress.md` files from `ai_workspace/`. Do NOT delete `project_context.md`, role skill files, or any other workspace content.
3. **Second commit (reset):** Commit the deletions only. Message format: `[pi-reset] <short description>` — same short tag as the summary commit for easy pairing in `git log`.

### Present Final Recap
Summarize everything accomplished across the full pipeline loop for this iteration:
- What was requested (Interviewer).
- How it was planned (Planner).
- What was built (Worker).
- Test results and quality status (Tester + Reviewer).
- Documentation produced (Summarizer).

### Offer Next Steps
Present the user with two paths:
1. **Continue to next iteration** — the two-commit reset flow (above) has already cleaned `_complete.md` files from the working tree while preserving them in git history. The pipeline will restart at role 01 (Interviewer) on the next session, building on top of what exists.
2. **Wrap up** — skip the reset and leave everything as-is. The project is done for now.

Only perform the two-commit reset if the user explicitly confirms they want to continue.

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits. If you spot issues in prior work, flag them for the user — do not fix them yourself.
- **Do not alter role summaries (`_complete.md` files)** except to create your own `07_finalizer_complete.md`. Those files are final records of each role's work.

If you notice something wrong in prior roles' output, document it and let the user decide. Do not go back and change things yourself.

## Deliverables
- Updated `ai_workspace/project_context.md` reflecting this iteration's outcomes.
- Git commits (and optional tags) capturing all work from this loop.
- Summary captured in `07_finalizer_complete.md` including: change log, commit references, and the user's chosen next step (reset or wrap up).

## Transition Criteria
The user confirms they are satisfied with the final state of the project and chooses either to reset for a new pipeline iteration or to wrap up entirely. This role does not proceed until the user makes that choice.
