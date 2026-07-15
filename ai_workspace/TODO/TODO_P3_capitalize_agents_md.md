## Capitalize AGENTS.md to Reflect Industry Standard

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-15
- **Context:** Out of scope for the current loop (git log depth calculation). User requested renaming `AGENTS.md` to follow industry-standard capitalization conventions.

## Description

Rename the master workflow orchestrator file from `AGENTS.md` to a properly capitalized variant that reflects industry standard naming:

1. **Determine target name** — Likely `Agents.md` (title case) or keep as-is if all-caps is intentional for visibility. Confirm with user during Interviewer phase which convention they prefer.
2. **Rename the file** in the repository root via git mv to preserve history.
3. **Update all references** across skill files, helper guides, and `project_overview.md` that reference `AGENTS.md`.

## Notes

- This is a cosmetic/naming change only — no functional impact.
- Consider whether other markdown files in the project should follow consistent naming conventions while this is addressed.
