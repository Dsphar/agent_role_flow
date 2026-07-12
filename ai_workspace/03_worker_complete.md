# 03 — Worker Complete

## Goal Summary
Extract in_progress guidance into a dedicated skill helper [ai-interviewer]

## What Was Accomplished
All 5 planned steps executed successfully:

1. **Created `in_progress_guide.md`** — Consolidated `_in_progress.md` lifecycle (naming, creation rules per role, usage, resume-on-restart, transition rename, "Going Back" rule) into a single skill helper at `ai_workspace/skill_helpers/in_progress_guide.md`.
2. **Updated `AGENTS.md`** — Replaced inline "In-Progress Files" subsection and "Going Back" mention with references to the new helper.
3. **Updated `03_worker.md`** — Replaced "Initialize In-Progress File" and "Track Progress" task bodies with helper references + Worker-specific checklist notes.
4. **Updated `transition_guide.md`** — Replaced inline rename logic with a reference to the new helper.
5. **Deleted `todos/extract-in-progress-skill-helper.md`** — Todo addressed this loop.

## Deviations from Plan
None — all steps followed as planned.

## Known Issues / TODOs
None introduced by this work. One pre-existing todo remains: `fix-git-log-truncation.md`.

## Files Created
- `ai_workspace/skill_helpers/in_progress_guide.md`

## Files Modified
- `AGENTS.md`
- `ai_workspace/roles/03_worker.md`
- `ai_workspace/skill_helpers/transition_guide.md`

## Files Deleted
- `ai_workspace/todos/extract-in-progress-skill-helper.md`

---

## Send-Back Summary

**Source:** Tester (Role 04) — missing in-progress file check in AGENTS.md startup sequence.

**Status:** Fix already applied by Planner during send-back re-planning (commit `413aa33`). Step 5 in the Role Detection flow now checks for `{NN}_rolename_in_progress.md` on startup with a reference to `skill_helpers/in_progress_guide.md`. No additional Worker changes needed.

[ai-worker-sendback]
