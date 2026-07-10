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
- **Per-role git commits:** Every role transitions with `<goal summary> [ai-{role-name}]`. Send-back cycles append `[ai-{role-name}-sendback]` at the end. Transition blocks on commit failure. Goal body sourced from `## Goal Summary` in `01_interviewer_complete.md`.
- **Send-back persistence:** `send_back.md` persists through the full re-run cycle with a `Current Role:` pointer and per-role log entries under "## Send-Back Log". Only the original sending role deletes it.
- **Finalizer always resets:** Single `[ai-finalizer]` commit, no "wrap up" option. Pipeline loops continuously.

## Recent Changes
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

> Loop/iteration history preserved in git via per-role commits (tag `[ai-{role-name}]` appended at end of message) and Finalizer reset commits (`[ai-finalizer]`). This file tracks current state only.

## How to Use
1. Start a session — agent reads AGENTS.md, auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), the pipeline resets for the next iteration.
