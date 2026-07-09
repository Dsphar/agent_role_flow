# Project Context

## What This Is
A sequential agent role pipeline for building software projects. The pipeline runs through 7 roles in order: Interviewer → Planner → Worker → Tester → Reviewer → Summarizer → Version Controller. Each role is defined by a skill file in `ai_workspace/roles/`.

## File Structure
```
AGENTS.md                          — Pipeline workflow instructions (read on every session start)
ai_workspace/
  roles/                           — Role skill files (01_Interviewer.md through 07_version_controller.md)
  project_context.md               — This file
  changelog.md                     — Loop-by-loop change history
  todo.md                          — Out-of-scope requests captured during role sessions
  *_complete.md                    — Per-role session summaries (deleted on pipeline reset)
```

## Key Design Decisions
- **Role isolation:** Each role has explicit "What You Must Not Do" guardrails to prevent bleeding into other roles' responsibilities.
- **State via files:** Pipeline state is inferred from `_complete.md` and `_in_progress.md` files — no external state tracking.
- **AGENTS.md kept minimal:** Trimmed to ~85 lines, removing redundant documentation-only sections. Operational logic only.

## Known Issues
- Guardrail enforcement is imperfect — roles can still break their own boundaries when directly prompted by the user. A fix (todo.md mechanism + strengthened guardrails) is proposed in `ai_workspace/todo.md` but not yet implemented.

## How to Use
1. Start a session — the agent reads AGENTS.md and auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Version Controller), choose to reset for next iteration or wrap up.
