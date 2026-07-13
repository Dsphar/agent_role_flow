## Remove redundant step 8 in Finalizer

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-13
- **Context:** Step 8 of `ai_workspace/roles/07_finalizer.md` runs `git add ai_workspace/project_overview.md`, but step 7 already ran `git add .` which stages everything including that file. The step is redundant and adds noise to the procedure.

## Description

Remove or reword step 8 in `ai_workspace/roles/07_finalizer.md`. Options:
- Remove it entirely (simplest).
- Reword as a no-op acknowledgment (e.g., "No additional staging needed — `project_overview.md` was already staged by step 7").

## Notes

Harmless redundancy — not blocking. Renumber subsequent steps if removed.
