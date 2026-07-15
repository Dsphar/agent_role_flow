# 07 — Finalizer

## Purpose
Finalize the pipeline loop: squash all per-role commits from the current iteration into a single multi-line commit, update project context, present a recap of what was built, and reset for the next iteration. This produces one clean commit per pipeline loop instead of 6–7 incremental ones. The pipeline always resets; there is no "wrap up" option.

## Inputs from Prior Roles
- Read all summary sections from `loop_state.md` body.
- `ai_workspace/project_overview.md` (if exists)
- `git diff` output

## Tasks

### Determine What Changed This Iteration
- Find the current-loop commits: first compute a dynamic depth limit — parse line 2 of `loop_state.md` for the history string (e.g., `History: Interviewer → Planner`), count role entries separated by `→`, multiply count by 2, add buffer of 5; if parsing fails or file missing use `-15`. Then run `git log --format="%H %s" -N <computed-depth>` and identify all commits whose subject line starts with the goal summary text (read `**Goal Summary:**` from line 1 of `loop_state.md`). Note the parent hash of the oldest matching commit — this is the pre-loop state.
- Run `git diff <parent-hash>..HEAD` to see file-level changes since before this loop started. If no matching commits are found, fall back to listing project root files and comparing against role summaries.
- Cross-reference diffs with summary sections in `loop_state.md` — match changed files to their purpose, flag unexplained changes for user review, and ask whether to log them as a new TODO file.
- Build a change log.

### Update Project Overview
Follow [`skill_helpers/project_overview_guide.md`](../skill_helpers/project_overview_guide.md) for both creating and updating `project_overview.md`. In brief:

- If the file does **not** exist: create it using the "Creating from Scratch" section of the guide.
- If it **does** exist: update to reflect current structural state only following the "Updating Across Loops" section. Do NOT append iteration history, changelog entries, or known issues — that data belongs in git via this role's squashed `[ai-pipeline]` commit. Keep concise but complete.

### Loop Reset and Handoff
Git is expected. If not initialized, ask the user before proceeding.

1. **Capture goal summary:** Read `**Goal Summary:**` from line 1 of `loop_state.md` to use as the short commit subject line. If it does not exist, compose your own short description (or ask the user).
2. **Read all role summaries for narrative body:** Before deleting anything, read every summary section from `loop_state.md` body to gather per-role outcomes (what was planned, built, tested, documented, reviewed). This content feeds into the multi-line commit message.
3. **Delete loop state and in-progress files:** Remove `ai_workspace/loop_state.md` and any `{NN}_*_in_progress.md` files from `ai_workspace/`. Do NOT delete `project_overview.md`, role skill files, or other workspace content.
4. **Check for zero matching commits:** If Step 1 found **zero** matching commits, skip to Step 9 (fallback). This means no roles from the current loop produced git commits with the expected subject prefix, so squashing would risk crossing loop boundaries.
5. **Soft reset to pre-loop state:** Run `git reset --soft <parent-hash>` where `<parent-hash>` is the parent of the oldest matching commit found in step 1. This stages ALL changes from the entire loop (all role artifacts + deletions) without discarding anything.
6. **Stage all working-tree changes including deletions:** Run `git add .` to ensure deleted files are recorded as `D` (deleted) in the index. The soft reset restores the index from the pre-loop tree, so file deletions made in step 3 need re-staging.
7. **Compose multi-line commit message:** Format as:
   - First line (subject): `<goal summary from step 1> [ai-pipeline]`
   - Blank line separator
   - Body paragraphs: Narrative of what happened across the pipeline loop, drawn from role summaries captured in step 2. Use structured sub-headers only for roles that actually ran (e.g., if Documenter was skipped via skip-docs, omit `### Documenter`).
8. **Commit with multi-line message:** Run `git commit -m "<subject>" -m "" -m "<body paragraph 1>" -m "<body paragraph 2>" ...` using multiple `-m` flags for the multi-line format.
9. **Fallback (no squash):** If reached from step 4, do a normal single commit of just your own changes: run `git add .` to stage `project_overview.md` + deleted files, then commit with `<goal summary> [ai-pipeline]`.
10. **If commit fails:** Block transition — present error to user and ask how to proceed.

### Present Final Recap
Summarize the full pipeline loop:
- What was requested (Interviewer), how it was planned (Planner), what was built (Worker).
- Test results and quality status (Tester + Reviewer).
- Documentation produced (Documenter).

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits — flag issues for the user.
- **Do not alter role summary sections in `loop_state.md`.**
- **Do not mention TODOs or make suggestions for future loops.**
- Out-of-scope requests → automatically capture as a new todo file per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## Deliverables
- Updated `ai_workspace/project_overview.md` reflecting this iteration's structural changes.
- Single git commit (`[ai-pipeline]`) capturing the context update and workspace reset.
- Verbal recap of everything accomplished across the full pipeline loop.