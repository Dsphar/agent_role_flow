## Reword "After confirmation:" phrasing in send-back role references

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-13
- **Context:** During review of the auto-handoff change, several role skill files and `sendback_guide.md` use "After confirmation:" when describing post-fix actions. This could be misread as contradicting the auto-handoff philosophy (no user confirmation prompts). Out of scope for Reviewer — requires edits to role skill files.

## Description

Reword "After confirmation:" phrasing in send-back sections across these files:
- `ai_workspace/roles/02_planner.md` (line 11)
- `ai_workspace/roles/03_worker.md` (line 14)
- `ai_workspace/roles/05_documenter.md` (line 16)
- `ai_workspace/skill_helpers/sendback_guide.md` (multiple instances in "Receiving a Send-Back" section)

Replace with clearer alternatives like "After completing fixes:" or "Once verified:" to align with auto-handoff language.

## Notes

- This is purely cosmetic/consistency — the meaning is clear in context and send-back mode was explicitly out of scope for the auto-handoff loop.
- The Planner should audit all instances and propose replacements; Worker would execute the edits.
