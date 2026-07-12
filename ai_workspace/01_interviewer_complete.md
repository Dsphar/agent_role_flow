## Goal Summary
Restructure todos into per-file folder with skill helper and template [ai-interviewer]

## What Is Being Built or Changed
- Create `ai_workspace/todo/` directory to hold one `.md` file per pending item.
- Create `ai_workspace/skill_helpers/todo_guide.md` — a skill helper defining the todo workflow (capturing, presenting, tracking completion) and including a template agents use when creating new todo files.
- Migrate all 5 existing pending items from `todo.md` into individual files under `ai_workspace/todo/`, named descriptively by the LLM at creation time.
- Delete original `ai_workspace/todo.md` after migration.
- Add brief cross-references to role skill files instructing them they may capture out-of-scope items as todos, and pointing them to the todo skill helper for the actual mechanics.

## Why It Matters (Goals / Success Criteria)
- Todos are currently a single monolithic file — splitting into per-file items makes them easier to manage, track, and remove individually.
- A dedicated skill helper standardizes how all roles capture and interact with todos, reducing inconsistency.
- The template ensures every todo has consistent structure: title, description, origin (role + date), and context.

## Technical Constraints and Preferences
- Folder name is singular: `todo/` not `todos/`.
- File names are descriptive short names chosen by the LLM at creation time (e.g., `fix-git-log-truncation.md`).
- Cross-references in role files should be brief — just tell roles they can capture out-of-scope items and point to the skill helper for details.
- This work satisfies both TODO #2 ("Create a todo skill helper") and TODO #4 ("Restructure todo list into per-file folder + skill-helper with template"). Both should be closed upon completion.

## Edge Cases or Special Considerations
- The 5 existing todos in `todo.md` need to be migrated faithfully — no loss of information (origin role, date, description).
- After migration and deletion of `todo.md`, any code/docs referencing `ai_workspace/todo.md` should be updated to reference the new structure.

## TODO Items Addressed
- **TODO #2:** Create a "todo" skill helper (captured by Interviewer, 2026-07-12) — satisfied by this work.
- **TODO #4:** Restructure todo list into per-file folder + skill-helper with template (captured by Interviewer, 2026-07-12) — satisfied by this work.
