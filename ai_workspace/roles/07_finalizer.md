# 07 — Finalizer

## Purpose
Finalize the pipeline loop: squash all per-role commits from current iteration into a single multi-line commit, update project context, present a recap of what was built, and reset for next iteration. Produces one clean commit per pipeline loop instead of 6–7 incremental ones. Pipeline always resets; no "wrap up" option.


## Tasks

### Determine What Changed This Iteration
- Find current-loop commits: compute dynamic depth per [Dynamic Git Log Depth](../../AGENTS.md#dynamic-git-log-depth-reviewer--finalizer) in AGENTS.md. Identify commits whose subject starts with goal summary (line 1). Note parent hash of oldest match = pre-loop state.
- Run `git diff <parent-hash>..HEAD` for file-level changes since before this loop started. If no matching commits found, fall back to listing project root files and comparing against role summaries.
- Cross-reference diffs with summary sections in `loop_state.md` — match changed files to purpose, flag unexplained changes for user review, ask whether to log as new TODO file.
- Build a change log.

### Update Project Overview
Follow [`skill_helpers/project_overview_guide.md`](../skill_helpers/project_overview_guide.md) for creating and updating `project_overview.md`. In brief:
- If file does **not** exist: create using "Creating from Scratch" section of guide.
- If it **does** exist: update to reflect current structural state only, following "Updating Across Loops" section. Do NOT append iteration history, changelog entries, or known issues — that data belongs in git via this role's squashed `[ai-pipeline]` commit. Keep concise but complete.

### Loop Reset and Handoff
Git is expected. If not initialized, ask user before proceeding.

1. **Capture goal summary:** Read `**Goal Summary:**` from line 1 of `loop_state.md` for short commit subject line. If it does not exist, compose your own (or ask user).
2. **Read all role summaries for narrative body:** Before deleting anything, read every summary section from `loop_state.md` body to gather per-role outcomes (what was planned, built, tested, documented, reviewed). This feeds into multi-line commit message.
3. **Delete loop state and in-progress files:** Remove `ai_workspace/loop_state.md` and any `{NN}_*_in_progress.md` files from `ai_workspace/`. Do NOT delete `project_overview.md`, role skill files, or other workspace content.
4. **Check for zero matching commits:** If Step 1 found **zero** matching commits, skip to Step 9 (fallback). No roles produced git commits with expected subject prefix, so squashing would risk crossing loop boundaries.
5. **Soft reset to pre-loop state:** Run `git reset --soft <parent-hash>` where `<parent-hash>` is parent of oldest matching commit from step 1. Stages ALL changes from entire loop (all role artifacts + deletions) without discarding anything.
6. **Stage all working-tree changes including deletions:** Run `git add .` to ensure deleted files are recorded as `D` in index. Soft reset restores index from pre-loop tree, so file deletions from step 3 need re-staging.
7. **Compose multi-line commit message:** Format:
   - First line (subject): `<goal summary from step 1> [ai-pipeline]`
   - Blank line separator
   - Body paragraphs: Narrative of what happened across pipeline loop, drawn from role summaries captured in step 2. Use structured sub-headers only for roles that actually ran (e.g., if Documenter was skipped via skip-docs, omit `### Documenter`).
8. **Commit with multi-line message:** Run `git commit -m "<subject>" -m "" -m "<body paragraph 1>" -m "<body paragraph 2>" ...` using multiple `-m` flags for multi-line format.
9. **Fallback (no squash):** If reached from step 4, do normal single commit of just your own changes: `git add .` to stage `project_overview.md` + deleted files, then commit with `<goal summary> [ai-pipeline]`.
10. **If commit fails:** Block transition — present error to user and ask how to proceed.

### Present Final Recap
Summarize full pipeline loop: what was requested (Interviewer), how it was planned (Planner), what was built (Worker). Test results and quality status (Tester + Reviewer). Documentation produced (Documenter).

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits — flag issues for user.
- **Do not alter role summary sections in `loop_state.md`.**
- **Do not mention TODOs or make suggestions for future loops.**

## Deliverables
Follow [`transition_guide.md`](../skill_helpers/transition_guide.md) for summary append, handoff update, in-progress file handling, and git commit. Role-specific deliverables:
- Updated `ai_workspace/project_overview.md` reflecting this iteration's structural changes.
- Single squashed git commit (`[ai-pipeline]`) capturing context update and workspace reset.
- Verbal recap of everything accomplished across full pipeline loop.
