# Project Overview

## What This Is
An AI agent sequential-pipeline system — 7 roles flowing through a structured workflow, orchestrated by `AGENTS.md`. Each role is a markdown skill file that defines persona, tasks, constraints, and deliverables. The pipeline loops: each iteration scopes work, plans it, builds it, tests it, documents it, reviews it, then squashes and resets for the next loop.

## File Structure
```
.gitignore                             ← Git ignore rules (Node.js, TypeScript, env files, IDE, OS noise)
AGENTS.md                              ← Master workflow orchestrator
ai_workspace/├── roles/
│   ├── 01_interviewer.md              ← Discovery & scoping
│   ├── 02_planner.md                  ← Architecture & implementation plan
│   ├── 03_worker.md                   ← Code execution
│   ├── 04_tester.md                   ← Testing (unit + e2e)
│   ├── 05_documenter.md              ← Documentation
│   ├── 06_reviewer.md                ← Quality gate review
│   └── 07_finalizer.md               ← Squash commits, reset for next loop
├── skill_helpers/
│   ├── cancel_guide.md                ← Mid-loop cancellation two-step flow (Roles 01–06)
│   ├── external_changes_guide.md      ← Detecting human-made changes before TODO scanning
│   ├── init_project_guide.md          ← Greenfield onboarding flow
│   ├── project_overview_guide.md      ← Canonical spec for creating/updating this file
│   ├── sendback_guide.md              ← Bug/critical-issue routing back to Worker
│   ├── todo_guide.md                  ← Out-of-scope item capture workflow + template
│   └── transition_guide.md            ← Role completion & git commit rules
└── TODO/                              ← Pending items (one .md file per item)
```

## Architecture Overview
- **Sequential pipeline:** Roles execute in order (01→07). Each appends a summary section to `ai_workspace/loop_state.md` before transitioning. The handoff history line (line 2) tracks progress: `**Current Role:** {Role} (Role NN) | History: ...<br>`
- **Send-back loop:** Tester and Reviewer can route issues back to Worker for fixes via `(in-sendback)` suffix in `loop_state.md` line 2. Issue details live inline under `### Send-Back Issues` subsections within the relevant role's summary section.
- **Git strategy:** Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit at end of each loop.
- **Goal summary on line 1:** Line 1 of `loop_state.md` holds `**Goal Summary:** <text><br>` (<100 chars), set by the Interviewer. All roles read this value for their git commit messages instead of parsing the body section.
- **Loop reset:** Finalizer deletes `loop_state.md`, updates this file, and resets for the next iteration.

## Tech Stack
- **Language:** Markdown (skill files, summaries, orchestration), TypeScript (pi extensions)
- **Tooling:** Left to the LLM — no prescribed tool-calling framework or shell dependency. Whatever tools the running model has access to are used as needed.
- **Version Control:** Git (per-role incremental commits, squashed by Finalizer)
- **Pi Extensions:** TypeScript extension files in `.pi/extensions/` using pi ExtensionAPI (`ctx.ui.setStatus`, `runSubAgent`, event listeners)

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
- Pipeline configuration via line 3 (centralized): Line 3 of `loop_state.md` carries global mutable key-value pairs (`skip_docs={true|false} | test_level={quick|deep|skip}`). All parsing logic — format spec, parsing rules, unrecognized-value guardrail, mutability rules, and both routing matrices — lives in a single canonical section in AGENTS.md. Role files and helpers reference it via anchor link instead of duplicating the content.
- Send-back full re-execution mandate: When Tester or Reviewer runs again during send-back mode (indicated by `(in-sendback)` suffix), they must re-execute their complete original task suite against the fixed implementation — not just verify the sent-back items. Sent-back fixes are treated as additional focus areas on top of the full re-run, preventing shortcutting that could miss regressions.
- Pipeline config questions moved from Planner to Interviewer: The `test_level` and `skip_docs` configuration questions are now asked by the Interviewer (Role 01) at end of session instead of the Planner, so pipeline scope is set earlier. Dynamic runtime recommendations with auto-select on ambiguous responses still apply.
- Token optimization of instruction files: All 13 instruction files (AGENTS.md, 7 role skill files, 6 helper guides) were compressed from ~13,600 to ~8,657 words (~36% reduction). Shared duplicated patterns consolidated into AGENTS.md only where net word count decreased. No new files created; full functionality preserved.
- Shared cross-role constraints consolidation: Common "What You Must Not Do" prohibitions across Worker, Tester, and Documenter moved to a single `Shared Cross-Role Constraints` section in AGENTS.md. Role skill files reference via anchor link instead of duplicating entries.
- In-progress guide merge: `in_progress_guide.md` merged into `transition_guide.md`. Later replaced with inline progress tracking conventions (no external files).
- State consolidation: `send_back.md` and `_in_progress.md` eliminated as separate state files. All runtime state now lives in `loop_state.md` — send-back issues under `### Send-Back Issues` subsections, progress via inline checkbox subsections.
- Sendback re-execution fix: Corrected contradiction in `sendback_guide.md` — now mandates full task suite re-execution during send-back (matching AGENTS.md), replacing "focus on sent-back items only" language that would have caused Tester/Reviewer to shortcut their checks.
- Git log depth canonicalization: AGENTS.md Dynamic Git Log Depth formula standardized to explicit `(count × 2) + 5`, resolving ambiguity with prior "add buffer of 5" wording.
- Mid-loop cancellation support: Roles 01–06 can handle user-initiated "cancel" requests via a two-step confirmation flow (cancel loop keeping TODO, or cancel entirely). Full git reset to pre-loop state, `loop_state.md` deleted. Procedure documented in `skill_helpers/cancel_guide.md`. Role 07 (Finalizer) excluded — already performing loop cleanup.
- Tester fallback compression: Reduced 3-level infrastructure fallback chain in `04_tester.md` to single streamlined version (propose → if declined, proceed with existing tools or manual checks).
- Project overview guide cleanup: Removed redundant "What Does Not Belong Here" table from `project_overview_guide.md` — same constraints already enforced via Finalizer role file and the guide's own "What Not to Do" subsection.
- Interviewer TODO validation on load: When the Interviewer loads a selected TODO item, it first validates whether the described problem is still valid (checking codebase/git history for evidence of prior fix). If no longer valid, informs user with relevant commit reference and recommends deletion. If still valid, presents a concise summary (title, context, description, notes) before proceeding to clarification questions.
- External changes detection: The Interviewer now detects human-made/external changes at startup (before TODO scanning) by running `git diff` for uncommitted changes and finding the most recent `[ai-pipeline]` commit as an anchor. Changes since that point are analyzed against `project_overview.md` to infer intent and impact. When found, the Interviewer offers a quick analysis loop (skipping Planner+Worker), normal full pipeline, or existing TODOs. Full procedure in `skill_helpers/external_changes_guide.md`.
- Tester project overview consultation: The Tester (Role 04) now consults `project_overview.md` before designing tests to understand existing test stack, patterns, and conventions. This ensures test design is informed by the broader project context rather than starting from scratch.
- Send-back rerouting to Worker: Tester and Reviewer send-backs now route directly to Worker (Role 03) for fixes instead of Planner (Role 02). Worker already has `loop_state.md` context during send-back and can ask the user directly for clarification, making re-planning unnecessary overhead. Dead send-back receiving instructions removed from Planner role file.
- Init guide `.gitignore` generation: Step 4b added to `init_project_guide.md` — guides the Interviewer to create a `.gitignore` combining global patterns (OS files, IDE configs, env files) and language-specific patterns referencing [github/gitignore](https://github.com/github/gitignore). Skip-if-exists logic for existing projects.
- Reviewer `.gitignore` verification: New sub-task added to `06_reviewer.md` — existence check (Critical/send-back if missing), exception path for legitimate cases, spot-check for build artifacts, dependency dirs, env files, and OS/IDE noise. Lightweight, not exhaustive.
- Send-back as default recommended option: When Tester or Reviewer finds issues relevant to the current loop's work, send-back is now explicitly marked as **(recommended)** over deferral as a TODO. Deferral remains for issues clearly unrelated to this loop's scope. Applied across `sendback_guide.md`, `04_tester.md`, and `06_reviewer.md`.
- Worker TODO-deletion step in pipeline: When a loop starts from an existing TODO item, the Interviewer now notes the TODO filename AND instructs the Planner to include a deletion step for the Worker. The Worker deletes the TODO file upon completing the addressed work. Mid-loop TODO captures remain deletable by any role that satisfies them. Clarified in `01_interviewer.md` and `todo_guide.md`.
- Pipeline-push extension (`.pi/extensions/pipeline-push.ts`): Renamed from `/autoloop` to `/pipeline-push`. Spawns sub-agent sessions for each pipeline loop iteration. Clears terminal screen and scrollback on start via ANSI escapes. Includes a `can_loop={true|false}` guard — the Planner sets it to `true` on line 3 of `loop_state.md`, and the extension refuses to spawn sessions if the flag is absent or false. Proactive monitoring via `turn_end`/`session_start` event listeners shows footer status when auto-looping is available. Listens for `session_shutdown` events (with `hasUI` guard) to clear footer status on session replacement.
- can_loop config flag: Line 3 of `loop_state.md` carries `can_loop={true|false}` alongside `test_level` and `skip_docs`. Interviewer initializes it to `false`; Planner sets it to `true` before transitioning. The pipeline-push extension reads this flag for its guard and proactive footer status.

## User-Preferred Patterns
_(No user-preferred patterns recorded yet. Add here when identified.)_
