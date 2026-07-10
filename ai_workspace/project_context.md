# Project Context

## What This Is
A sequential agent role pipeline for building software projects. The pipeline runs through 7 roles in order: Interviewer → Planner → Worker → Tester → Summarizer → Reviewer → Finalizer. Each role is defined by a skill file in `ai_workspace/roles/`.

## File Structure
```
AGENTS.md                          — Pipeline workflow instructions (read on every session start)
ai_workspace/
  roles/                           — Role skill files (01_Interviewer.md through 07_finalizer.md)
  project_context.md               — This file
  todo.md                          — Out-of-scope requests captured during role sessions
  *_complete.md                    — Per-role session summaries (deleted on pipeline reset)
```

## Key Design Decisions
- **Role isolation:** Each role has explicit "What You Must Not Do" guardrails to prevent bleeding into other roles' responsibilities.
- **State via files:** Pipeline state is inferred from `_complete.md` and `_in_progress.md` files — no external state tracking.
- **AGENTS.md kept minimal:** Trimmed to ~85 lines, removing redundant documentation-only sections. Operational logic only.
- **Summarizer before Reviewer (Loop 2):** Documentation is produced before the quality gate so it gets reviewed too. Previously docs were written after review and slipped through unchecked.
- **User-prompted send-back mechanism:** Tester/Reviewer present findings and ask the user whether to create `send_back.md` (routes to Planner on next session start, which then advances through Worker) or defer as a TODO. The pipeline does not auto-send — the human decides.
- **Per-role git commits (Loop N):** Every role commits its work during transition using `[ai-{role-name}]` prefix. Send-back cycles use `[ai-{role-name}-sendback]`. This preserves progress incrementally instead of only at Finalizer. Transition blocks on commit failure so the user can resolve identity/repo issues.
- **Send-back persistence (Loop N):** `send_back.md` persists through the entire re-run cycle — every role sees it and appends a log entry under "## Send-Back Log" for an audit trail. Only the original sending role deletes it when its re-run passes.

## Recent Changes
- **Loop N — Send-back cycle (2026-07-09):** Reviewer found two critical issues; Worker fixed both; Tester confirmed resolution.
  - **C1 (Infinite Loop on Reviewer Send-Back):** Restructured the send-back flow to use a `Current Role:` pointer in `send_back.md` instead of deleting `_complete.md` files. The pointer explicitly tells role detection which skill file to load, eliminating the loop where the Reviewer would re-load itself. All affected roles (Worker, Tester, Reviewer) now follow the same pattern: create send-back with `Current Role:` header, append summaries on re-run, advance pointer sequentially.
  - **C2 (Guardrail Contradiction):** Updated "What You Must Not Do" in both Worker and Summarizer skill files to acknowledge the mandatory per-role transition commit defined in AGENTS.md. The phrasing is now: *"Do not handle version control beyond the mandatory per-role transition commit defined in AGENTS.md."*
  - **W1 (Multiple `Current Role:` lines):** Warning noted — unlikely in practice if both Tester and Reviewer append pointer lines simultaneously. Tracked as TODO for simplification.
- **Loop N (2026-07-09):** Added per-role git commits at every pipeline transition using `[ai-{role-name}]` prefix. Send-back cycles use `[ai-{role-name}-sendback]`. Transition blocks on commit failure so the user can resolve identity/repo issues.
- **Loop N-1 (2026-07-09):** Added TODO self-maintenance to the pipeline — Interviewer notes addressed TODO items by origin, Planner adds a removal step, Worker executes. Removed completed TODO "Consolidate Send-Back Cleanup Logic" from `todo.md`.

## Known Issues
- **W1:** Ambiguity if both Tester and Reviewer append `Current Role:` lines to `send_back.md`. Unlikely in practice.
- Guardrail enforcement is imperfect — roles can still break their own boundaries when directly prompted by the user.
- Finalizer's commit behavior may need review now that every role already commits (tracked as TODO for next loop).

## Pending TODOs (from `ai_workspace/todo.md`)
Four items are tracked for future pipeline loops:
1. **Review Finalizer Flow After Per-Role Commits** — adjust Finalizer to avoid duplicate commits.
2. **Add `--` Separator in Git Commit Messages** — improve readability of `[ai-{role-name}]` commit prefixes.
3. **Handle Partial/Re-Run Loops in Finalizer** — acknowledge send-backs in the final recap.
4. **Finalizer Should Always Reset, Never Offer Wrap-Up** — remove the "wrap up" option from Finalizer.

> **Note:** Loop/iteration records are preserved in git via Finalizer summary commits tagged `[pi-summary]` / `[pi-reset]`. This file tracks current project state only — no iteration history.

## How to Use
1. Start a session — the agent reads AGENTS.md and auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), choose to reset for next iteration or wrap up.
