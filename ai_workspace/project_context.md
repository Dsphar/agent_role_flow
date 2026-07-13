# Project Context

## What This Is
An AI agent sequential-pipeline system — 7 roles flowing through a structured workflow, orchestrated by `AGENTS.md`. Each role is a markdown skill file that defines persona, tasks, constraints, and deliverables. The pipeline loops: each iteration scopes work, plans it, builds it, tests it, documents it, reviews it, then squashes and resets for the next loop.

## File Structure
```
AGENTS.md                              ← Master workflow orchestrator
ai_workspace/
├── roles/
│   ├── 01_Interviewer.md              ← Discovery & scoping
│   ├── 02_planner.md                  ← Architecture & implementation plan
│   ├── 03_worker.md                   ← Code execution
│   ├── 04_tester.md                   ← Testing (unit + e2e)
│   ├── 05_documenter.md              ← Documentation
│   ├── 06_reviewer.md                ← Quality gate review
│   └── 07_finalizer.md               ← Squash commits, reset for next loop
├── skill_helpers/
│   ├── init_project_guide.md          ← Greenfield onboarding flow
│   ├── sendback_guide.md              ← Bug/critical-issue routing back to Planner
│   ├── todo_guide.md                  ← Out-of-scope item capture workflow + template
│   └── transition_guide.md            ← Role completion & git commit rules
└── TODO/                              ← Pending items (one .md file per item)
```

## Architecture Overview
- **Sequential pipeline:** Roles execute in order (01→07). Each produces a `{NN}_rolename_complete.md` summary before transitioning.
- **Send-back loop:** Tester and Reviewer can route issues back to Planner for re-planning via `send_back.md`.
- **Git strategy:** Per-role incremental commits during the pipeline, squashed into one `[ai-finalizer]` commit at end of each loop.
- **Loop reset:** Finalizer deletes `_complete.md` files, updates this file, and resets for the next iteration.

## Tech Stack
- **Language:** Markdown (skill files, summaries, orchestration)
- **Tooling:** Left to the LLM — no prescribed tool-calling framework or shell dependency. Whatever tools the running model has access to are used as needed.
- **Version Control:** Git (per-role incremental commits, squashed by Finalizer)
- **No runtime code** — this is a prompt/orchestration system, not an application

## Key Design Decisions
- Role separation enforced via "What You Must Not Do" sections in each skill file
- Lowercase `_complete.md` filenames regardless of role casing
- Goal summary from Interviewer used as commit subject across all roles
- Out-of-scope requests are captured as individual files in `ai_workspace/TODO/` per `skill_helpers/todo_guide.md`
- Tool calling is LLM-driven — no hardcoded bash/shell assumptions
- Only one `[ai-finalizer]` squash commit exists per pipeline loop; intermediate per-role commits are transient and do not persist post-Finalizer

## Known Issues
None.

## Current Pipeline State
- **Loop 1** — Complete. Squashed by Finalizer.
- Work this loop: Restructured todo system from monolithic `todo.md` to per-file `TODO/` folder with skill helper
- **Loop 2** — Complete. Squashed by Finalizer.
- Work this loop: Corrected stale git model references in project_context.md to reflect the squashed-commit reality
- **Loop 3** — Complete. Squashed by Finalizer.
- Work this loop: Extracted `_in_progress.md` lifecycle guidance into `skill_helpers/in_progress_guide.md`; added startup check for in-progress files in AGENTS.md Role Detection step 5
- **Loop 4** — Complete. Squashed by Finalizer.
- Work this loop: Fixed git log truncation in Finalizer role — replaced `--oneline` with `--format="%H %s"` to preserve full commit hashes and subject lines
- **Loop 5** — Complete. Squashed by Finalizer.
- Work this loop: Renamed `todos/` folder to `TODO/` and updated all references across the project

## Recent Changes
- Renamed workspace folder: `todos/` → `TODO/` with all references updated across AGENTS.md, role files, skill helpers, and project context (2026-07-12)
- Fixed git log truncation: replaced `git log --oneline` with `git log --format="%H %s"` in Finalizer role to preserve full hashes and subject lines (2026-07-12)
- Restructured todo system: replaced monolithic `todo.md` with per-file `TODO/` folder + `todo_guide.md` skill helper (2026-07-12)
- Extracted in-progress file guidance into dedicated skill helper, updated AGENTS.md/Worker/Transition Guide references (2026-07-12)
- Initial project context created (2026-07-12)
