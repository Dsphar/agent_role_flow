# 01 — Interviewer Complete

## What Was Requested
Restructure the role pipeline to improve workflow quality and naming. Three changes:

### Change 1: Move Summarizer Before Reviewer
- **Current order:** Worker → Tester → Reviewer → Summarizer → Version Controller
- **New order:** Worker → Tester → Summarizer → Reviewer → Finalizer
- **Why:** Documentation should be reviewed as part of the quality gate, not written after review is complete. Currently docs slip past review unchecked.

### Change 2: Rename Version Controller to Finalizer
- **Current name:** `07_version_controller.md`
- **New name:** `07_finalizer.md` (and corresponding `_complete.md`)
- **Why:** "Finalizer" better reflects the role's purpose as the pipeline's closing step — it handles commits, project context updates, final recap, and reset/wrap-up decisions.

### Change 3: Add Documentation Review to the Reviewer
- Add a new task section to `05_reviewer.md` for reviewing documentation quality (accuracy, completeness, clarity, consistency).
- Remove or adjust the existing guardrail that says "Do not modify project documentation" — it was only relevant because docs were written *after* review. Now that Summarizer comes first, the Reviewer should assess docs without modifying them.

## Files to Modify
- `ai_workspace/roles/05_reviewer.md` — add doc review task, adjust guardrail
- `ai_workspace/roles/07_version_controller.md` — rename to `07_finalizer.md`, update internal references
- `AGENTS.md` — update role pipeline table (step 06 order, step 07 name)
- `ai_workspace/project_context.md` — update iteration history when complete

## Additional TODO Items Added
Two items added to `ai_workspace/todo.md` for future iterations:
1. Investigate more git usage in the pipeline
2. Have Interviewer suggest pending work from `todo.md` at startup

## Success Criteria
- Pipeline ordering reflects new sequence (Summarizer before Reviewer)
- Finalizer role renamed consistently across all references
- Reviewer can review documentation without violating guardrails
- No existing functionality is lost in the restructure
