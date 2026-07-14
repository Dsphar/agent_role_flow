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
- **Sequential pipeline:** Roles execute in order (01→07). Each appends a summary section to `ai_workspace/loop_state.md` before transitioning. The handoff history line (line 1) tracks progress: `Current Role: {Role} (Role NN) | History: ...`
- **Send-back loop:** Tester and Reviewer can route issues back to Planner for re-planning via `(in-sendback)` suffix in `loop_state.md` + `send_back.md` for issue details.
- **Git strategy:** Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit at end of each loop.
- **Loop reset:** Finalizer deletes `loop_state.md`, updates this file, and resets for the next iteration.

## Tech Stack
- **Language:** Markdown (skill files, summaries, orchestration)
- **Tooling:** Left to the LLM — no prescribed tool-calling framework or shell dependency. Whatever tools the running model has access to are used as needed.
- **Version Control:** Git (per-role incremental commits, squashed by Finalizer)
- **No runtime code** — this is a prompt/orchestration system, not an application

## Key Design Decisions
- Role separation enforced via "What You Must Not Do" sections in each skill file
- Single shared `loop_state.md` replaces per-role `_complete.md` files; handoff history on line 1 uses format `Current Role: {Role} (Role NN) | History: ...`
- In-progress files (`_in_progress.md`) are appended to `loop_state.md` as subsections at transition time, then deleted
- Goal summary from Interviewer's section in `loop_state.md` used as commit subject across all roles
- Out-of-scope requests are captured as individual files in `ai_workspace/TODO/` per `skill_helpers/todo_guide.md`. Only the Interviewer scans and presents pending TODOs at startup; all roles retain the ability to capture new ones.
- Tool calling is LLM-driven — no hardcoded bash/shell assumptions
- Only one `[ai-pipeline]` squash commit exists per pipeline loop; intermediate per-role commits are transient and do not persist post-Finalizer
- Skip-docs feature: when all tests pass, the Tester prompts the user to skip documentation. If skipped, a minimal Documenter section is pre-appended to `loop_state.md` and handoff line advances past Documenter so the pipeline flows naturally to Reviewer. An undo path (revert the appended section and handoff line) restores normal flow.
- Planner guardrails use forceful prohibitive language with concrete acceptable/unacceptable behavior examples; send-back mode explicitly does not relax any role's constraints
- User-facing prompt convention: all binary-choice prompts presented to users list options as "Option A (recommended) or Option B?" so that "yes" = recommended/default and "no" = alternative. This applies across all roles (skip-docs, send-back vs defer, etc.)
- Auto-handoff after role completion: roles automatically declare handoff ready once work is done — no user confirmation prompt at transition time. Mid-transition feedback from the user keeps the role in-session for adjustments.
- Per-role git commits are a top-level Step 5 in `transition_guide.md` (promoted from sub-bullets) with guardrail language explaining consequences of skipping, plus a Pre-Handoff Checklist (`- [ ]` checkboxes) that roles verify before transitioning begins.
- Reviewer scope audit: the Reviewer (Role 06) performs a Scope Audit as its first task, using `git diff` to compare this loop's file-level changes against the full problem statement from the Interviewer. Out-of-scope items are presented with Absorb (recommended) or Revert options.
- Tester flow refinement: "Suggestions" promoted from Deliverables bullet into its own task section ("Generate and Present Suggestions") to achieve temporal separation from the Skip-Docs prompt, avoiding numbered-list collision during user interaction.
- Tester mandatory test plan tracking: The Tester must create `ai_workspace/04_tester_in_progress.md` with a checkbox list of all planned test steps after clarifying expectations with the user. Each step is marked `[x]` on completion or left `[ ]` with failure notes. The file is updated after every step for resume-on-restart support, appended to `loop_state.md` as a subsection at transition time, then deleted.
- Pipeline configuration via line 2: Line 2 of `loop_state.md` carries global mutable key-value pairs (`skip_docs={yes|no} | test_level={quick|deep|skip}`). The Planner asks skip-docs and test-level questions upfront; any downstream role can update line 2 if the user changes their mind (with a summary note). A routing matrix in `transition_guide.md` determines Worker and Tester handoff targets based on these values.
- Routing matrix for dynamic pipeline paths: Six combinations of skip_docs/test_level map to specific handoff chains. Both roles skipped routes Worker → Reviewer directly. The matrix is replicated in Planner, transition guide, and referenced by Worker/Tester/Documenter roles.
- Send-back full re-execution mandate: When Tester or Reviewer runs again during send-back mode (indicated by `(in-sendback)` suffix), they must re-execute their complete original task suite against the fixed implementation — not just verify the sent-back items. Sent-back fixes are treated as additional focus areas on top of the full re-run, preventing shortcutting that could miss regressions.

## User-Preferred Patterns
_(No user-preferred patterns recorded yet. Add here when identified.)_
