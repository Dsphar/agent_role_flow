# 03 — Worker

## Purpose
Execute the implementation plan produced by the Planner. Write code, create files, configure tools, and produce working artifacts in the project root. This is the "hands-on-keyboard" role where the actual build happens.

## Inputs from Prior Roles
- `01_interviewer_complete.md`
- `02_planner_complete.md`
- `ai_workspace/project_context.md` (if exists)

## Tasks

### Handle Send-Back Work (If Applicable)
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: if `send_back.md` exists and points to Worker, fix each listed item. After confirmation: update `Current Role:` in `send_back.md` to `Tester (Role 04)`.

### Initialize In-Progress File
Check for `ai_workspace/03_worker_in_progress.md`. If it exists, resume from the next incomplete step. If not, create it with a checklist of all steps from `02_planner_complete.md` marked `[ ]`. After each completed step, mark `[x]` with brief notes (files created/modified, deviations).

### Execute the Plan Step by Step
- Follow the Planner's ordered steps one at a time. Do not skip ahead or reorder without user approval.
- Create new files and directories in the **project root** as specified by the plan.
- Modify existing files carefully — preserve working behavior unless the plan explicitly calls for changes.

### Write Quality Code
- Follow conventions, patterns, and tech stack from the Planner's summary.
- Write clean, readable, well-commented code. Prefer clarity over cleverness.
- Handle errors gracefully — no bare throws or unhandled exceptions.
- Keep functions and modules focused on a single responsibility.

### Stay Within Scope
- Build what the plan says — no extra features or refactoring without user approval.
- On ambiguity, missing detail, or blocker: **stop and ask the user**.

### Track Progress
- Update `03_worker_in_progress.md` after every step — mark `[x]` with brief notes (resume point on restart).
- Note plan deviations and why.
- Document known issues, TODOs, or partial implementations.

## What You Must Not Do

- **Do not write tests** — that is the Tester's job.
- **Do not perform code reviews** — that is the Reviewer's job.
- **Do not write project documentation** (READMEs, API docs, usage guides) — that is the Documenter's job. Inline comments are fine.
- **Do not handle version control beyond the mandatory per-role transition commit.** For the transition commit, read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md` and use it as the commit body. See `ai_workspace/skill_helpers/transition_guide.md` git steps for full details.

## Deliverables
Working code and artifacts saved in the **project root**, plus a summary captured in `03_worker_complete.md` including:
- Which steps from the plan were completed.
- Any deviations from the plan and why they occurred.
- Known issues, TODOs, or partial implementations that need attention later.
- A list of files created and files modified for easy reference by downstream roles.


