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
└── todos/                             ← Pending items (one .md file per item)
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
- Out-of-scope requests are captured as individual files in `ai_workspace/todos/` per `skill_helpers/todo_guide.md`
- Tool calling is LLM-driven — no hardcoded bash/shell assumptions

## Known Issues
1. `git log --oneline` truncation can break Finalizer's subject-line matching (`todos/fix-git-log-truncation.md`)
2. Stale references to per-role commit model in docs (`todos/update-project-context-git-model.md`)
3. `_in_progress.md` instructions not extracted to a skill helper (`todos/extract-in-progress-skill-helper.md`)

## Current Pipeline State
- **Loop 1** — Complete. Squashed by Finalizer.
- Work this loop: Restructured todo system from monolithic `todo.md` to per-file `todos/` folder with skill helper

## Recent Changes
- Restructured todo system: replaced monolithic `todo.md` with per-file `todos/` folder + `todo_guide.md` skill helper (2026-07-12)
- Initial project context created (2026-07-12)
