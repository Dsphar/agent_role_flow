## Goal Summary
Rename Summarizer role to Documenter across all files

## What Is Being Changed
The "Summarizer" role (Role 05) is being renamed to "Documenter". This is a purely cosmetic rename — no changes to responsibilities, behavior, or deliverables.

## Files Affected
- `ai_workspace/roles/05_summarizer.md` → rename file to `05_documenter.md`, update internal name/title
- `ai_workspace/project_context.md` — "Summarizer before Reviewer" design decision note
- `ai_workspace/roles/03_worker.md` — peer role references
- `ai_workspace/roles/04_tester.md` — peer role references
- `ai_workspace/roles/06_reviewer.md` — peer role references
- `ai_workspace/roles/07_finalizer.md` — peer role references
- `ai_workspace/transition_guide.md` — pipeline flow references

## Success Criteria
- No remaining "summarizer" or "Summarizer" strings in any workspace file
- `05_documenter.md` exists with updated name/title
- Pipeline still correctly references role 05 as Documenter everywhere

## Constraints
- Only rename the label — do not alter role responsibilities, inputs, tasks, guardrails, or deliverables
- Update all cross-references consistently (case-sensitive: both "Summarizer" and "summarizer")
