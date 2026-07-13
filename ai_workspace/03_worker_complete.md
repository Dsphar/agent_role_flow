# 03 — Worker Complete

## Goal Summary
Add priority prefixes and switch to underscores in TODO filenames, update all refs

---

## Steps Completed

### Step 1 — Rename all four TODO files [x]
Renamed each file in `ai_workspace/TODO/`, replacing dashes with underscores and prepending `P2_`:
- `add-priority-indicator-to-todo-filenames.md` → `P2_add_priority_indicator_to_todo_filenames.md`
- `change-todo-filename-dashes-to-underscores.md` → `P2_change_todo_filename_dashes_to_underscores.md`
- `fix-role-file-casing-inconsistency.md` → `P2_fix_role_file_casing_inconsistency.md`
- `fix-sendback-guide-common-steps-numbering.md` → `P2_fix_sendback_guide_common_steps_numbering.md`

### Step 2 — Update `todo_guide.md` with new filename convention [x]
Modified `ai_workspace/skill_helpers/todo_guide.md`:
- Replaced kebab-case filename instruction with `P{N}_{underscore_separated_name}.md` format
- Added inline priority level definitions: P0-critical, P1-high, P2-medium, P3-low
- Updated example filenames to reflect new convention

### Step 3 — Update Interviewer role for priority assignment during init [x]
Modified `ai_workspace/skill_helpers/init_project_guide.md` Step 6:
- Added instruction to assign P-level (`P0`–`P3`) when creating TODO files from proposals
- Specified underscore-separated filename format

### Step 4 — Delete the two addressed TODO files [x]
Deleted:
- `ai_workspace/TODO/P2_add_priority_indicator_to_todo_filenames.md`
- `ai_workspace/TODO/P2_change_todo_filename_dashes_to_underscores.md`

---

## Files Modified
- `ai_workspace/skill_helpers/todo_guide.md` — updated filename convention and priority definitions
- `ai_workspace/skill_helpers/init_project_guide.md` — added priority assignment instruction in Step 6

## Files Renamed (in `ai_workspace/TODO/`)
- All four TODO files renamed with `P2_` prefix and underscores

## Files Deleted
- `ai_workspace/TODO/P2_add_priority_indicator_to_todo_filenames.md`
- `ai_workspace/TODO/P2_change_todo_filename_dashes_to_underscores.md`

## Deviations from Plan
None.

## Known Issues
None.

---

## Send-Back Summary

### Item: Stale Example in `todo_guide.md` — Line 65
The Tester flagged a stale kebab-case filename example (`fix-git-log-truncation.md`) that should use the new `P{N}_{underscore}` convention. Upon inspection, this fix had already been applied in a prior pass — the file currently reads `(e.g., "Addressed \`P2_fix_git_log_truncation.md\`")` which is correct. No changes needed.

**Status:** Verified as already fixed. No modifications required.
