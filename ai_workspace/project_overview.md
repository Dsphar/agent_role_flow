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
│   ├── init_project_guide.md          ← Greenfield onboarding flow
│   ├── project_overview_guide.md      ← Canonical spec for creating/updating this file
│   ├── sendback_guide.md              ← Bug/critical-issue routing back to Planner
│   ├── todo_guide.md                  ← Out-of-scope item capture workflow + template
│   └── transition_guide.md            ← Role completion & git commit rules
└── TODO/                              ← Pending items (one .md file per item)
```

## Architecture Overview
- **Sequential pipeline:** Roles execute in order (01→07). Each appends a summary section to `ai_workspace/loop_state.md` before transitioning. The handoff history line (line 2) tracks progress: `**Current Role:** {Role} (Role NN) | History: ...<br>`
- **Send-back loop:** Tester and Reviewer can route issues back to Planner for re-planning via `(in-sendback)` suffix in `loop_state.md` line 2. Issue details live inline under `### Send-Back Issues` subsections within the relevant role's summary section.
- **Git strategy:** Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit at end of each loop.
- **Goal summary on line 1:** Line 1 of `loop_state.md` holds `**Goal Summary:** <text><br>` (<100 chars), set by the Interviewer. All roles read this value for their git commit messages instead of parsing the body section.
- **Loop reset:** Finalizer deletes `loop_state.md`, updates this file, and resets for the next iteration.

## Tech Stack
- **Language:** Markdown (skill files, summaries, orchestration)
- **Tooling:** Left to the LLM — no prescribed tool-calling framework or shell dependency. Whatever tools the running model has access to are used as needed.
- **Version Control:** Git (per-role incremental commits, squashed by Finalizer)
- **No runtime code** — this is a prompt/orchestration system, not an application

## Key Design Decisions
- Role separation enforced via "What You Must Not Do" sections in each skill file
- Single shared `loop_state.md` replaces per-role `_complete.md` files; handoff history on line 2 uses format `**Current Role:** {Role} (Role NN) | History: ...<br>`
- Inline progress tracking: each role maintains a `### Current-Role Steps` checkbox subsection within its own `loop_state.md` summary section. No external `_in_progress.md` files.
- Goal summary stored on line 1 of `loop_state.md` as `**Goal Summary:** <text><br>` (<100 chars), set by the Interviewer. All roles read this value for their git commit messages.
- Out-of-scope requests are captured as individual files in `ai_workspace/TODO/` per `skill_helpers/todo_guide.md`. Only the Interviewer scans and presents pending TODOs at startup; all roles retain the ability to capture new ones.
- Tool calling is LLM-driven — no hardcoded bash/shell assumptions
- Only one `[ai-pipeline]` squash commit exists per pipeline loop; intermediate per-role commits are transient and do not persist post-Finalizer
- Skip-docs feature: when all tests pass, the Tester prompts the user to skip documentation. If skipped, a minimal Documenter section is pre-appended to `loop_state.md` and handoff line advances past Documenter so the pipeline flows naturally to Reviewer. An undo path (revert the appended section and handoff line) restores normal flow.
- Planner guardrails use forceful prohibitive language with concrete acceptable/unacceptable behavior examples; send-back mode explicitly does not relax any role's constraints
- User-facing prompt convention: all binary-choice prompts presented to users list options as "Option A (recommended) or Option B?" so that "yes" = recommended/default and "no" = alternative. This applies across all roles (skip-docs, send-back vs defer, etc.)
- Auto-handoff after role completion: roles automatically declare handoff ready once work is done — no user confirmation prompt at transition time. Mid-transition feedback from the user keeps the role in-session for adjustments.
- Per-role git commits are a top-level Step 5 in `transition_guide.md` (promoted from sub-bullets) with guardrail language explaining consequences of skipping, plus a Pre-Handoff Checklist (`- [ ]` checkboxes) that roles verify before transitioning begins.
- Reviewer scope audit: the Reviewer (Role 06) performs a Scope Audit as its first task, using `git diff` to compare this loop's file-level changes against the full problem statement from the Interviewer. Out-of-scope items are presented with Absorb (recommended) or Revert options.
- Dynamic git log depth: Reviewer and Finalizer compute a bounded `-N` depth limit for their `git log --format="%H %s"` commands using `(history entry count × 2) + 5`, falling back to `-15` on parse failure. This keeps log scans proportional to the current loop's commit footprint instead of scanning unbounded history.
- Tester flow refinement: "Suggestions" promoted from Deliverables bullet into its own task section ("Generate and Present Suggestions") to achieve temporal separation from the Skip-Docs prompt, avoiding numbered-list collision during user interaction.
- Tester mandatory test plan tracking: The Tester creates a `### Current-Role Steps` checkbox subsection inline in `loop_state.md` with all planned test steps. Each step marked `[x]` on completion or left `[ ]` with failure notes. Updated after every step for resume-on-restart support.
- Pipeline configuration via line 3 (centralized): Line 3 of `loop_state.md` carries global mutable key-value pairs (`skip_docs={yes|no} | test_level={quick|deep|skip}`). All parsing logic — format spec, parsing rules, unrecognized-value guardrail, mutability rules, and both routing matrices — lives in a single canonical section in AGENTS.md. Role files and helpers reference it via anchor link instead of duplicating the content.
- Send-back full re-execution mandate: When Tester or Reviewer runs again during send-back mode (indicated by `(in-sendback)` suffix), they must re-execute their complete original task suite against the fixed implementation — not just verify the sent-back items. Sent-back fixes are treated as additional focus areas on top of the full re-run, preventing shortcutting that could miss regressions.
- Planner auto-select on ambiguous responses: When the user gives a non-committal answer ("yes", "ok", "sure", etc.) to pipeline config questions (skip-docs, test-level), the Planner automatically accepts whichever option it flagged as **(recommended)** for that question. No hard-coded defaults — uses whatever was recommended at runtime.
- Token optimization of instruction files: All 13 instruction files (AGENTS.md, 7 role skill files, 6 helper guides) were compressed from ~13,600 to ~8,657 words (~36% reduction). Shared duplicated patterns consolidated into AGENTS.md only where net word count decreased. No new files created; full functionality preserved.
- Shared cross-role constraints consolidation: Common "What You Must Not Do" prohibitions across Worker, Tester, and Documenter moved to a single `Shared Cross-Role Constraints` section in AGENTS.md. Role skill files reference via anchor link instead of duplicating entries.
- In-progress guide merge: `in_progress_guide.md` merged into `transition_guide.md`. Later replaced with inline progress tracking conventions (no external files).
- State consolidation: `send_back.md` and `_in_progress.md` eliminated as separate state files. All runtime state now lives in `loop_state.md` — send-back issues under `### Send-Back Issues` subsections, progress via inline checkbox subsections.
- Sendback re-execution fix: Corrected contradiction in `sendback_guide.md` — now mandates full task suite re-execution during send-back (matching AGENTS.md), replacing "focus on sent-back items only" language that would have caused Tester/Reviewer to shortcut their checks.
- Git log depth canonicalization: AGENTS.md Dynamic Git Log Depth formula standardized to explicit `(count × 2) + 5`, resolving ambiguity with prior "add buffer of 5" wording.
- Tester fallback compression: Reduced 3-level infrastructure fallback chain in `04_tester.md` to single streamlined version (propose → if declined, proceed with existing tools or manual checks).
- Project overview guide cleanup: Removed redundant "What Does Not Belong Here" table from `project_overview_guide.md` — same constraints already enforced via Finalizer role file and the guide's own "What Not to Do" subsection.

## User-Preferred Patterns
_(No user-preferred patterns recorded yet. Add here when identified.)_
