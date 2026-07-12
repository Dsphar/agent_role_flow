# 07 — Finalizer

## Purpose
Finalize the pipeline loop: squash all per-role commits from the current iteration into a single multi-line commit, update project context, present a recap of what was built, and reset for the next iteration. This produces one clean commit per pipeline loop instead of 6–7 incremental ones. The pipeline always resets; there is no "wrap up" option.

## Inputs from Prior Roles
- All `_complete.md` summaries (`01` through `06`)
- `ai_workspace/project_context.md` (if exists)
- `git diff` output

## Tasks

### Determine What Changed This Iteration
- Find the current-loop commits: run `git log --format="%H %s"` and identify all commits whose subject line starts with the goal summary text (from `01_interviewer_complete.md`). Note the parent hash of the oldest matching commit — this is the pre-loop state.
- I run `git diff <parent-hash>..HEAD` to see file-level changes since before this loop started. If no matching commits are found, fall back to listing project root files and comparing against role summaries.
- Cross-reference diffs with `_complete.md` summaries — match changed files to their purpose, flag unexplained changes for user review.
- Build a comprehensive change log.

### Update Project Context
If `project_context.md` does **not** exist: create it with full project overview (what was built, tech stack, structure, decisions, known issues, how to run/test).

If it **does** exist: update to reflect current state only. Do NOT append iteration history — loop records are in git via this role's squashed `[ai-finalizer]` commit. Keep concise but complete.

### Loop Reset and Handoff
Git is expected. If not initialized, ask the user before proceeding.

1. **Capture goal summary:** Read the `## Goal Summary` section from `01_interviewer_complete.md` to use as the short commit subject line. If `01_interviewer_complete.md` does not exist, compose your own short description (or ask the user).
2. **Read all role summaries for narrative body:** Before deleting anything, read every `{NN}_*_complete.md` file in `ai_workspace/` to gather per-role outcomes (what was planned, built, tested, documented, reviewed). This content feeds into the multi-line commit message.
3. **Delete `_complete.md` and `_in_progress.md` files:** Remove all `{NN}_*_complete.md` and `{NN}_*_in_progress.md` from `ai_workspace/`. Do NOT delete `project_context.md`, role skill files, or other workspace content.
4. **Find current-loop commits by subject-line matching:** Run `git log --format="%H %s"` to list recent commits. Identify all commits whose subject line starts with the goal summary text captured in step 1 (e.g., if the summary is "Build a markdown todo app", match commits like `a1b2c3d4e5f6... Build a markdown todo app [ai-planner]`, `f7e8d9c0b1a2... Build a markdown todo app [ai-worker]`). These are the commits belonging to the current pipeline loop. Note the parent hash of the **oldest** (last in log output / earliest chronologically) matching commit — this is the squash boundary.
5. **Decide squash vs. fallback:** If step 4 found **zero** matching commits, skip to step 10 (fallback). This means no roles from the current loop produced git commits with the expected subject prefix, so squashing would risk crossing loop boundaries.
6. **Soft reset to pre-loop state:** Run `git reset --soft <parent-hash>` where `<parent-hash>` is the parent of the oldest matching commit found in step 4. This stages ALL changes from the entire loop (all role artifacts + deletions) without discarding anything.
7. **Stage updated project context:** Ensure `project_context.md` is staged (`git add ai_workspace/project_context.md`). The soft reset already staged everything, but this ensures the context update is included explicitly.
8. **Compose multi-line commit message:** Format as:
   - First line (subject): `<goal summary from step 1> [ai-finalizer]`
   - Blank line separator
   - Body paragraphs: Narrative of what happened across the pipeline loop, drawn from role summaries captured in step 2. Use structured sub-headers per role that ran (e.g., `### Planner`, `### Worker`) for readability.
9. **Commit with multi-line message:** Run `git commit -m "<subject>" -m "" -m "<body paragraph 1>" -m "<body paragraph 2>" ...` using multiple `-m` flags for the multi-line format.
10. **Fallback (no squash):** If reached from step 5, do a normal single commit of just your own changes: stage `project_context.md` + deleted files, commit with `<goal summary> [ai-finalizer]`.
11. **If commit fails:** Block transition — present error to user and ask how to proceed.

### Present Final Recap
Summarize the full pipeline loop:
- What was requested (Interviewer), how it was planned (Planner), what was built (Worker).
- Test results and quality status (Tester + Reviewer).
- Documentation produced (Documenter).

## What You Must Not Do

- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits — flag issues for the user.
- **Do not alter role summaries (`_complete.md` files).**
- **Do not mention TODOs or make suggestions for future loops.**
- Out-of-scope requests → capture as a todo per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## Deliverables
- Updated `ai_workspace/project_context.md` reflecting this iteration's outcomes.
- Single git commit (`[ai-finalizer]`) capturing the context update and workspace reset.
- Verbal recap of everything accomplished across the full pipeline loop.


