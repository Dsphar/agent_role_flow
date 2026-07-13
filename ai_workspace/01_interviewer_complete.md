# 01 — Interviewer Complete

## Goal Summary
Add priority prefixes and switch to underscores in TODO filenames, update all refs

## What Is Being Changed
- Add a capital-P priority prefix (`P0`–`P3`) to all TODO filenames in `ai_workspace/TODO/`.
- Switch the descriptive portion of TODO filenames from kebab-case (dashes) to underscore-separated names.
- Final filename format: `P{N}_{descriptive_name}.md` (e.g., `P0_add_priority_indicator_to_todo_filenames.md`).

## Why It Matters / Success Criteria
- Priority levels at a glance from directory listings improve workflow triage.
- Consistent underscore naming across the project eliminates casing/style inconsistencies.
- All references to TODO filenames updated everywhere — no stale dash-based or unprefixed refs remain.

## Technical Constraints and Preferences
- **Priority levels:** `P0-critical`, `P1-high`, `P2-medium`, `P3-low`.
- **Filename format:** Capital P, underscore between priority and name, underscores throughout descriptive part.
- **Scope of updates:** Rename existing files, update `skill_helpers/todo_guide.md`, update Interviewer role for priority assignment during init_project_guide Step 6, and update all other references across role files, guides, project_context.md, etc.

## Edge Cases or Special Considerations
- Two TODO items (#1 and #2) are being addressed together — they overlap in scope (both change filename conventions). The Planner should consolidate them into a single coherent plan rather than treating as separate changes.
- Existing TODO files need reasonable priority assignments where not obvious from context.

## TODO Items Addressed This Loop
- `add-priority-indicator-to-todo-filenames.md`
- `change-todo-filename-dashes-to-underscores.md`
