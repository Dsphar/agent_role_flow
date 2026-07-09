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
- **Auto send-back mechanism (Loop 2):** Tester/Reviewer can create `send_back_to_worker.md` to automatically route bugs back to Worker on next session start, then re-run validation from that point forward.

## Known Issues
- Guardrail enforcement is imperfect — roles can still break their own boundaries when directly prompted by the user. A fix (todo.md mechanism + strengthened guardrails) is proposed in `ai_workspace/todo.md` but not yet implemented.

> **Note:** Loop/iteration records are preserved in git via Finalizer summary commits tagged `[pi-summary]` / `[pi-reset]`. This file tracks current project state only — no iteration history.

## How to Use
1. Start a session — the agent reads AGENTS.md and auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), choose to reset for next iteration or wrap up.
