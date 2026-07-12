# Update project_context.md to reflect squashed-commit git model

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-10
- **Context:** `ai_workspace/project_context.md` under "Key Design Decisions" and the bottom loop-history note still describe per-role commits as the git record. After squash, only one `[ai-finalizer]` commit exists per loop. Out-of-scope for the Reviewer — deferred as a todo.

## Description

Update `ai_workspace/project_context.md` so that:
- "Key Design Decisions" no longer references a per-role commit model as the final record.
- Any loop-history notes reflect that only one squashed `[ai-finalizer]` commit exists per pipeline loop.

## Notes

The intermediate per-role commits still exist during the pipeline — they are just squashed at the end. Clarify this distinction if helpful.
