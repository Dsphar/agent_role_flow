# Extract in_progress instructions into a dedicated skill helper

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-07-12
- **Context:** The `_in_progress.md` guidance is currently embedded directly in `AGENTS.md`. Out-of-scope for the Interviewer — deferred as a todo.

## Description

Move the `_in_progress.md` guidance out of `AGENTS.md` and into its own skill-helper file under `ai_workspace/skill_helpers/`. Considerations:
- Only **some** roles will use in-progress files — the helper should clarify which ones and how.
- Role files that need it should reference the new helper instead.
- `AGENTS.md` should no longer contain those instructions directly.

## Notes

Review current `_in_progress.md` mentions across `AGENTS.md` and role files to determine scope of extraction.
