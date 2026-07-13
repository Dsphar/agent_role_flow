## Add Priority Indicator to TODO Filenames

- **Captured by:** Worker (Role 03)
- **Date:** 2026-07-12
- **Context:** The user wants a structured priority indicator embedded in TODO filenames so the Interviewer can quickly see and recommend higher-priority items without reading each file individually.

## Description

Update the TODO naming convention to include a priority prefix in the filename:

1. Define a short set of priority levels (e.g., `p0-critical`, `p1-high`, `p2-medium`, `p3-low`).
2. Update `skill_helpers/todo_guide.md` to document the new filename format: `{priority}-{descriptive-name}.md`.
3. Update the Interviewer role so it can assign and recommend priorities when proposing TODO items during Step 6 of `init_project_guide.md`.
4. Rename existing TODO files in `ai_workspace/TODO/` to include a priority prefix (assign reasonable defaults if unclear).

## Notes

- Priority should be part of the filename, not just file content — visible at a glance from directory listing.
- Keep priority labels short and sortable (e.g., `p0`, `p1`, etc.).
- The Interviewer is the primary role that proposes TODOs, so it needs clear guidance on when to assign each level.
