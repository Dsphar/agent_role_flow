# Project Overview

## What This Is
An AI agent sequential-pipeline system — 7 roles flowing through a structured workflow, orchestrated by `AGENTS.md`. Each role is a markdown skill file that defines persona, tasks, constraints, and deliverables. The pipeline loops: each iteration scopes work, plans it, builds it, tests it, documents it, reviews it, then squashes and resets for the next loop.

## File Structure
```
AGENTS.md                              ← Master workflow orchestrator
ai_workspace/
├── roles/
│   ├── 01_interviewer.md              ← Discovery & scoping
│   ├── 02_planner.md                  ← Architecture & implementation plan
│   ├── 03_worker.md                   ← Code execution
│   ├── 04_tester.md                   ← Testing (unit + e2e)
│   ├── 05_documenter.md              ← Documentation
│   ├── 06_reviewer.md                ← Quality gate review
│   └── 07_finalizer.md               ← Squash commits, reset for next loop
├── skill_helpers/
│   ├── in_progress_guide.md           ← In-progress file lifecycle & resume behavior
│   ├── init_project_guide.md          ← Greenfield onboarding flow
│   ├── project_overview_guide.md      ← Canonical spec for creating/updating this file
│   ├── sendback_guide.md              ← Bug/critical-issue routing back to Planner
│   ├── todo_guide.md                  ← Out-of-scope item capture workflow + template
│   └── transition_guide.md            ← Role completion & git commit rules
└── TODO/                              ← Pending items (one .md file per item)
```

## Architecture Overview
- **Sequential pipeline:** Roles execute in order (01→07). Each produces a `{NN}_rolename_complete.md` summary before transitioning.
- **Send-back loop:** Tester and Reviewer can route issues back to Planner for re-planning via `send_back.md`.
- **Git strategy:** Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit at end of each loop.
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
- Out-of-scope requests are captured as individual files in `ai_workspace/TODO/` per `skill_helpers/todo_guide.md`. Only the Interviewer scans and presents pending TODOs at startup; all roles retain the ability to capture new ones.
- Tool calling is LLM-driven — no hardcoded bash/shell assumptions
- Only one `[ai-pipeline]` squash commit exists per pipeline loop; intermediate per-role commits are transient and do not persist post-Finalizer
- Skip-docs feature: when all tests pass, the Tester prompts the user to skip documentation. If skipped, a minimal `05_documenter_complete.md` stub is pre-created so the pipeline flows naturally to Reviewer. An undo path (delete the stub) restores normal flow.
- Planner guardrails use forceful prohibitive language with concrete acceptable/unacceptable behavior examples; send-back mode explicitly does not relax any role's constraints
- User-facing prompt convention: all binary-choice prompts presented to users list options as "Option A (recommended) or Option B?" so that "yes" = recommended/default and "no" = alternative. This applies across all roles (skip-docs, send-back vs defer, etc.)
- Auto-handoff after role completion: roles automatically declare handoff ready once work is done — no user confirmation prompt at transition time. Mid-transition feedback from the user keeps the role in-session for adjustments.
- Per-role git commits are a top-level Step 5 in `transition_guide.md` (promoted from sub-bullets) with guardrail language explaining consequences of skipping, plus a Pre-Handoff Checklist (`- [ ]` checkboxes) that roles verify before transitioning begins.
- Tester flow refinement: "Suggestions" promoted from Deliverables bullet into its own task section ("Generate and Present Suggestions") to achieve temporal separation from the Skip-Docs prompt, avoiding numbered-list collision during user interaction.

## User-Preferred Patterns
_(No user-preferred patterns recorded yet. Add here when identified.)_
