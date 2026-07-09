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
- **User-prompted send-back mechanism:** Tester/Reviewer present findings and ask the user whether to create `send_back_to_worker.md` (routes to Worker on next session start) or defer as a TODO. The pipeline does not auto-send — the human decides.
- **Per-role git commits (Loop N):** Every role commits its work during transition using `[ai-{role-name}]` prefix. Send-back cycles use `[ai-{role-name}-sendback]`. This preserves progress incrementally instead of only at Finalizer. Transition blocks on commit failure so the user can resolve identity/repo issues.
- **Send-back persistence (Loop N):** `send_back_to_worker.md` persists through the entire re-run cycle — every role sees it and appends a log entry under "## Send-Back Log" for an audit trail. Only the original sending role deletes it when its re-run passes, and also clears `_complete.md` files for roles after itself so they re-run.

## Recent Changes
- **Loop N (2026-07-09):** Added per-role git commits at every pipeline transition. Every role now runs `git add -A && git commit` during its transition step, using `[ai-{role-name}]` prefix (or `[ai-{role-name}-sendback]` in send-back mode). Also restructured the send-back flow: `send_back_to_worker.md` persists through the full cycle with a per-role audit log; only the original sending role deletes it on passing re-run. Discovered and fixed a bug where the `-sendback` prefix could never apply because the file was deleted too early.
- **Loop N-1 (2026-07-09):** Added TODO self-maintenance to the pipeline — Interviewer notes addressed TODO items by origin, Planner adds a removal step, Worker executes. Removed completed TODO "Consolidate Send-Back Cleanup Logic" from `todo.md`.

## Known Issues
- Guardrail enforcement is imperfect — roles can still break their own boundaries when directly prompted by the user. Remaining items in `ai_workspace/todo.md` track proposed improvements.
- Finalizer's commit behavior may need review now that every role already commits (tracked as TODO for next loop).

> **Note:** Loop/iteration records are preserved in git via Finalizer summary commits tagged `[pi-summary]` / `[pi-reset]`. This file tracks current project state only — no iteration history.

## How to Use
1. Start a session — the agent reads AGENTS.md and auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), choose to reset for next iteration or wrap up.
