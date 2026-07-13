# 02 — Planner Complete

## Goal Summary
Add priority prefixes and switch to underscores in TODO filenames, update all refs

---

## Architecture Overview

This is a naming-convention change across the `ai_workspace/TODO/` directory and its supporting documentation. No new files or directories are created. The change has three layers:

1. **File renames** — existing TODO files get `P2_` prefix and underscores replacing dashes
2. **Documentation updates** — `todo_guide.md` and Interviewer role reflect the new convention going forward
3. **Cleanup** — delete the two TODO files whose work is being performed this loop

### Key Decisions
- All 4 existing TODOs assigned `P2` (medium) per user direction
- The two items being addressed (`add-priority-indicator...`, `change-todo-filename-dashes...`) are consolidated into a single change — they overlap in scope since both modify filename conventions
- New convention: `P{N}_{underscore_separated_name}.md` where N is 0–3

---

## File/Module Map

### Files to Rename (in `ai_workspace/TODO/`)
| Old Name | New Name |
|---|---|
| `add-priority-indicator-to-todo-filenames.md` | `P2_add_priority_indicator_to_todo_filenames.md` |
| `change-todo-filename-dashes-to-underscores.md` | `P2_change_todo_filename_dashes_to_underscores.md` |
| `fix-role-file-casing-inconsistency.md` | `P2_fix_role_file_casing_inconsistency.md` |
| `fix-sendback-guide-common-steps-numbering.md` | `P2_fix_sendback_guide_common_steps_numbering.md` |

### Files to Modify
| File | Changes |
|---|---|
| `ai_workspace/skill_helpers/todo_guide.md` | Update filename format from kebab-case to `P{N}_{underscore_name}.md`; update examples; add priority level definitions and assignment guidance in capture step 3 |
| `ai_workspace/roles/01_Interviewer.md` | Add priority assignment instruction during init_project_guide Step 6 (when creating TODO items from proposals) — instruct Interviewer to assign a P-level when capturing accepted items |

### Files to Delete (after rename, these two are addressed this loop)
| File | Reason |
|---|---|
| `P2_add_priority_indicator_to_todo_filenames.md` | Addressed by this plan |
| `P2_change_todo_filename_dashes_to_underscores.md` | Addressed by this plan (consolidated with above) |

### Files Referenced but Not Modified
- `ai_workspace/01_interviewer_complete.md` — contains old filenames as historical record; no update needed since it documents what was planned, not current state
- `ai_workspace/project_context.md` — no direct TODO filename references that need updating

---

## Ordered Implementation Steps

### Step 1 — Rename all four TODO files
Rename each file in `ai_workspace/TODO/`, replacing dashes with underscores and prepending `P2_`:
- `add-priority-indicator-to-todo-filenames.md` → `P2_add_priority_indicator_to_todo_filenames.md`
- `change-todo-filename-dashes-to-underscores.md` → `P2_change_todo_filename_dashes_to_underscores.md`
- `fix-role-file-casing-inconsistency.md` → `P2_fix_role_file_casing_inconsistency.md`
- `fix-sendback-guide-common-steps-numbering.md` → `P2_fix_sendback_guide_common_steps_numbering.md`

### Step 2 — Update `todo_guide.md` with new filename convention
In the "Capturing an Out-of-Scope Item" section, update step 3:
- Replace "short, kebab-case" with the new format: `P{N}_{underscore_separated_name}.md`
- Add priority level definitions inline: `P0-critical`, `P1-high`, `P2-medium`, `P3-low`
- Instruct the capturing role to assign an appropriate P-level based on urgency/impact
- Update the example filenames from kebab-case (`fix-git-log-truncation.md`) to the new format (e.g., `P2_fix_git_log_truncation.md`)

### Step 3 — Update Interviewer role for priority assignment during init
In `ai_workspace/roles/01_Interviewer.md`, update the section referencing init_project_guide Step 6 (the TODO proposal step). Add instruction that when creating TODO files from accepted proposals, the Interviewer should assign a P-level prefix (`P0`–`P3`) and use underscore-separated filenames. This ensures new items created during greenfield onboarding follow the convention from day one.

### Step 4 — Delete the two addressed TODO files
Delete:
- `ai_workspace/TODO/P2_add_priority_indicator_to_todo_filenames.md`
- `ai_workspace/TODO/P2_change_todo_filename_dashes_to_underscores.md`

These items are satisfied by this loop's work. The remaining two (`P2_fix_role_file_casing_inconsistency.md`, `P2_fix_sendback_guide_common_steps_numbering.md`) stay for future loops.

---

---

## Send-Back Summary

**Trigger:** Tester (Role 04) sent back a stale example in `todo_guide.md`.

### Work Done
- Fixed line 65 in `ai_workspace/skill_helpers/todo_guide.md`: updated the "Tracking Completion" example from old kebab-case format (`fix-git-log-truncation.md`) to new convention with priority prefix and underscores (`P2_fix_git_log_truncation.md`).

### Additional Items Captured
- Created `P1_strengthen_planner_guardrails.md` in `ai_workspace/TODO/` — meta-improvement to strengthen Planner role guardrails against doing implementation work.

---

## Risks and Open Questions
- **No technical risks** — this is purely file renames and documentation edits
- **No open questions** — scope confirmed by user, priorities assigned
