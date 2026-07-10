# Project Context

## What This Is
A sequential agent role pipeline for building software projects. Seven roles run in order: Interviewer → Planner → Worker → Tester → Documenter → Reviewer → Finalizer. Each role is defined by a skill file in `ai_workspace/roles/`.

## File Structure
```
AGENTS.md                          — Pipeline workflow instructions (read every session start)
ai_workspace/
  roles/                           — Role skill files (01_Interviewer.md through 07_finalizer.md)
  project_context.md               — This file
  todo.md                          — Out-of-scope requests from prior sessions
    roles/transition_guide.md      — Transition flow + send-back rules (loaded at role completion only)
  *_complete.md                    — Per-role session summaries (deleted on Finalizer reset)
```

## Key Design Decisions
- **Role isolation:** Each role has "What You Must Not Do" guardrails to prevent bleeding into other roles.
- **State via files:** Pipeline state inferred from `_complete.md` / `_in_progress.md` — no external tracking.
- **AGENTS.md minimal (~50 lines):** Transition flow, send-back rules, and guardrail prose extracted to `transition_guide.md` (loaded only at role completion). Role skill files trimmed similarly. Operational logic only.
- **Documenter before Reviewer:** Docs produced before the quality gate so they get reviewed too.
- **User-prompted send-back:** Tester/Reviewer present findings and ask whether to create `send_back.md` (routes to Planner) or defer as TODO. Human decides — no auto-send.
- **Per-role git commits (pre-squash):** Every role transitions with `<goal summary> [ai-{role-name}]`. Send-back cycles append `[ai-{role-name}-sendback]` at the end. Transition blocks on commit failure. Goal body sourced from `## Goal Summary` in `01_interviewer_complete.md`.
- **Finalizer squash:** The Finalizer squashes all per-role commits from a loop into a single multi-line `[ai-finalizer]` commit using subject-line matching + `git reset --soft`. One clean commit per pipeline iteration.
- **Send-back persistence:** `send_back.md` persists through the full re-run cycle with a `Current Role:` pointer and per-role log entries under "## Send-Back Log". Only the original sending role deletes it.
- **Finalizer always resets and squashes:** All per-role commits from a loop are squashed into a single multi-line `[ai-finalizer]` commit via `git reset --soft`. No "wrap up" option. Pipeline loops continuously.

## Recent Changes
- **Interviewer scoped git log truncation fix for Finalizer (2026-07-10):** Identified that `git log --oneline` in `07_finalizer.md` truncates subject lines to ~52 characters, breaking prefix matching when goal summaries exceed ~40 chars. Fix: replace with `git log --format="%H %s"`. No code changes produced this loop — Interviewer only (roles 02-06 had no file-level work). W1 and W2 remain in todo.md for next iteration.
- **transition_guide fixes: scope deviation revert, send-back routing, commit conventions (2026-07-10):** Reverted unintended first-person prose in `transition_guide.md` git section back to second-person. Fixed send-back routing so Tester and Reviewer arrows point only to Planner (02), removing Worker (03) as a target in both ASCII diagram and text summary. Enforced commit message convention across role files — all roles now reference `## Goal Summary` from `01_interviewer_complete.md` as the commit body source, with `[ai-{role-name}]` or `[ai-{role-name}-sendback]` appended at end. Removed 3 completed TODO items (W1 and W2 remain). Verified 12/12 tests, zero bugs.
- **Documenter option lists improved with numeric numbering + skip (2026-07-10):** Completed TODO cleanup — removed stale "Improve Documenter Option Lists" entry from `todo.md`. The actual skill file changes were applied out-of-band in a prior loop. Verified 4/4 tests, zero bugs.
- **Finalizer squash flow implemented (2026-07-10):** Rewrote `07_finalizer.md` "Loop Reset and Handoff" to squash all per-role commits from a pipeline loop into a single multi-line `[ai-finalizer]` commit. Uses subject-line matching against the Interviewer's goal summary to identify current-loop commits, then `git reset --soft` to the pre-loop parent hash. Falls back to normal single commit if no matches found. Two send-back cycles resolved BUG-1 (cross-loop squashing), BUG-2 (stale per-role reference), and BUG-3 (step numbering). Updated `project_context.md` to reflect squash model.
- **Tester option lists improved with numeric numbering (2026-07-10):** Added a 3-option numbered testing-depth prompt (Quick/Deep/Skip) to the "Clarify Testing Expectations" section in `04_tester.md`. Converted send-back bug options from `(a)`/`(b)` labels to numeric `1.`/`2.` format. Minor formatting-only change — verified 4/4 tests, zero bugs.
- **Finalizer sources commit description from Interviewer Goal Summary (2026-07-10):** Added step 1 to "Loop Reset and Handoff" in `07_finalizer.md` — read `## Goal Summary` from `01_interviewer_complete.md` before deleting `_complete.md` files, with fallback if file missing. Renumbered existing steps accordingly. Removed completed TODO from `todo.md`. Verified 5/5 tests, zero blocking bugs.
- **Imperative shell commands clarified (2026-07-10):** Rewrote ambiguous "Run git ..." phrases in `transition_guide.md` and `07_finalizer.md` to first-person "I run git ..." for agent clarity. 4 planned changes across 2 files, verified by Tester with zero blocking bugs. One low-severity scope deviation (extra "I skip" change) deferred to todo.md.
- **Multi-round questioning added to Interviewer (2026-07-10):** Added automatic multi-round follow-up capability in `01_Interviewer.md` — up to 3 rounds total, natural flow with no round announcements, internal round tracking via conversation context, and hard-stop uncertainty flagging at round 3. Resolved via send-back cycle for round-counting ambiguity.
- **Commit message format reordered (2026-07-10):** Moved `[ai-{role-name}]` tag from prefix to suffix across all pipeline files and removed the `--` separator. Pattern is now `{body} [ai-{role-name}]`. Applied via send-back cycle: Tester caught one miss in `07_finalizer.md`, Planner expanded file map, Worker fixed both issues, Reviewer confirmed clean.
- **Improved Finalizer reset flow (2026-07-10):** Renamed "Execute Single-Commit Reset Flow" to "Loop Reset and Handoff" in `07_finalizer.md`. Made the "Proceed to Reset" section self-contained with explicit step-by-step instructions instead of relying on an implicit cross-reference. Fixed typo ("wil" → "will") and updated handoff messaging in `transition_guide.md`. Removed completed TODO from `todo.md`. Verified 8/8 tests, zero bugs.
- **Moved transition_guide.md into roles folder (2026-07-10):** Relocated `transition_guide.md` from `ai_workspace/` to `ai_workspace/roles/` so all operational skill/guide files live in one directory. Updated path references across AGENTS.md, project_context.md, and role skill files for Planner, Worker, and Documenter. Verified 8/8 tests, zero bugs.
- **Return-to-role rules added to AGENTS.md (2026-07-10):** Added two behavioral guardrails under "During a Role Session" enforcing that agents resume work immediately after capturing out-of-scope requests into `todo.md`, and that TODO capture does not count as task completion. Addresses the problem of agents drifting off after logging items. Verified 12/12 tests, zero bugs, approved by Reviewer.
- **In-Progress Files instructions moved to AGENTS.md (2026-07-10):** Relocated the `{NN}_rolename_in_progress.md` pattern documentation from `transition_guide.md` into a new `### In-Progress Files` subsection in `AGENTS.md` (after Conflict Check). Casing note preserved inline in transition_guide step 4. Verified 7/7, zero bugs.
- **Hard stop between role handoffs (2026-07-10):** Replaced auto-load-next-role behavior with a hard stop in `transition_guide.md`. After a transition commit succeeds, the agent now tells the user the handoff is ready and instructs them to clear their session — the next role loads on fresh start via normal startup detection. Old step 5 removed. Verified by Tester (7/7 tests pass), approved by Reviewer.
- **Summarizer → Documenter rename (2026-07-10):** Renamed Role 05 from "Summarizer" to "Documenter" across all operational files (skill file, peer role references, transition guide diagram, project context). Purely cosmetic — no behavioral changes. Two out-of-scope requests captured in `todo.md` for next loop.
- **Context loading trim (2026-07-09):** Reduced `AGENTS.md` and all 7 role files by ~98 lines total (~30-35%). Extracted transition flow to `transition_guide.md`. Trimmed prose in Inputs, Tasks, guardrails, and Transition Criteria sections. All operational behavior preserved — verified by Tester with zero bugs found. Reviewer sent back two suggestions (filename casing note, send-back routing diagram) — both resolved via Planner send-back.

## Known Issues
- **W1:** Ambiguity if both Tester and Reviewer append `Current Role:` lines to `send_back.md` simultaneously. Unlikely in practice.
- Guardrail enforcement is imperfect — roles can break boundaries when directly prompted by the user.

> Loop/iteration history preserved in git via squashed `[ai-finalizer]` commits — one per pipeline iteration. Per-role commits are absorbed into the squash. This file tracks current state only.

## How to Use
1. Start a session — agent reads AGENTS.md, auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), the pipeline resets for the next iteration.
