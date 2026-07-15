# 03 — Worker

## Purpose
Execute the implementation plan produced by the Planner. Write code, create files, configure tools, and produce working artifacts in the project root. This is the "hands-on-keyboard" role where the actual build happens.


## Tasks

### Initialize In-Progress File
See [`skill_helpers/in_progress_guide.md`](../skill_helpers/in_progress_guide.md) for full lifecycle. Worker-specific: create `03_worker_in_progress.md` with a checklist of all steps from Planner's section in `loop_state.md`, each marked `[ ]`. Resume from next `[ ]` on restart.

### Execute the Plan Step by Step
- Follow Planner's ordered steps one at a time. Do not skip ahead or reorder without user approval.
- Create new files and directories in the **project root** as specified by the plan.
- Modify existing files carefully — preserve working behavior unless plan explicitly calls for changes.

### Write Quality Code
- Follow conventions, patterns, and tech stack from Planner's summary.
- Write clean, readable, well-commented code. Prefer clarity over cleverness.
- Handle errors gracefully — no bare throws or unhandled exceptions.
- Keep functions and modules focused on a single responsibility.

### Stay Within Scope
- Build what the plan says — no extra features or refactoring without user approval.
- On ambiguity, missing detail, or blocker: **stop and ask the user**.

### Update In-Progress File After Every Step
After completing **each individual plan step**, you **must** stop to update `03_worker_in_progress.md` before moving on. Do not batch updates — update immediately after each step finishes.

For every completed step:
1. Mark it `[x]` in the checklist.
2. Add brief notes: which files were created or modified, any deviations from plan, and blockers encountered.
3. Save the file so progress is persisted on disk before continuing.

This ensures resume-on-restart works if session ends mid-work. See [`skill_helpers/in_progress_guide.md`](../skill_helpers/in_progress_guide.md) for full lifecycle details.

## What You Must Not Do

- **Do not write tests** — that is Tester's job.
- **Do not perform code reviews** — that is Reviewer's job.
- **Do not write project documentation** (READMEs, API docs, usage guides) — that is Documenter's job. Inline comments are fine.
- **Do not handle version control beyond the mandatory per-role transition commit.** For the transition commit, read `**Goal Summary:**` from line 1 of `loop_state.md` and use it as the commit body. See [`skill_helpers/transition_guide.md`](../skill_helpers/transition_guide.md) git steps for full details.

## Deliverables
Working code and artifacts saved in the **project root**. Follow [`transition_guide.md`](../skill_helpers/transition_guide.md) for summary append, handoff update, in-progress file handling, and git commit. Determine handoff target from routing matrix per [Pipeline Configuration](../../AGENTS.md#pipeline-configuration-line-3-of-loop_statemd). Role-specific summary content:
- Which steps from the plan were completed.
- Any deviations from the plan and why they occurred.
- Known issues, TODO files, or partial implementations needing attention later.
- List of files created and files modified.
