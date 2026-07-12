## Goal Summary
Extract in_progress guidance into a dedicated skill helper [ai-interviewer]

---

## What Is Being Changed
All `_in_progress.md` instructions scattered across `AGENTS.md`, the Worker role, and the Transition Guide will be consolidated into a single new file: `ai_workspace/skill_helpers/in_progress_guide.md`. After extraction:
- `AGENTS.md` will have **no** references to in-progress files (the "In-Progress Files" subsection and the mention in "Going Back" are removed)
- The Worker role (`03_worker.md`) will reference the new helper instead of embedding its own workflow details
- The Transition Guide (`transition_guide.md`) will reference the new helper for the rename logic
- The Finalizer (`07_finalizer.md`) keeps its existing deletion step unchanged — no reference to the helper needed

## Why It Matters (Goals / Success Criteria)
- Single source of truth for in-progress file behavior across the pipeline
- Cleaner `AGENTS.md` without embedded role-specific operational details
- Consistent with the project's pattern of extracting guidance into skill helpers (e.g., `todo_guide.md`, `sendback_guide.md`)

## Technical Constraints and Preferences
- New filename: `in_progress_guide.md` under `ai_workspace/skill_helpers/`
- Only Worker and Transition Guide should reference the new helper
- Finalizer does not need a reference — it just deletes `_in_progress.md` files during reset
- Existing behavior is preserved — content is relocated, not redesigned

## Edge Cases or Special Considerations
- The "Going Back" section in `AGENTS.md` mentions keeping `_in_progress.md` files — this needs careful removal without breaking the rest of that section's flow
- The Worker's checklist workflow (create from plan, mark `[x]`, resume on restart) is more detailed than the generic concept in `AGENTS.md` — both should be merged into the helper

## Related TODO
This addresses `todos/extract-in-progress-skill-helper.md`. The Worker should delete that file upon completion.
