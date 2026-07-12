# 02 — Planner Complete

## Architecture Overview

Replace the monolithic `ai_workspace/todo.md` with a **per-file todo system**: each pending item gets its own `.md` file inside `ai_workspace/todos/`. A new skill helper (`todo_guide.md`) defines the workflow and provides a template for creating new todos. Role files get brief cross-references pointing agents to the skill helper when they capture out-of-scope requests.

### Key Decisions
- **Folder name:** `todos/` (plural) — more natural than singular.
- **File naming:** Descriptive short names chosen at creation time (e.g., `fix-git-log-truncation.md`).
- **Template-driven:** Every todo file follows a consistent structure defined in the skill helper template.
- **Backward compat:** `AGENTS.md` and any role references to `todo.md` are updated to point to the new system.

## File/Module Map

### New Files
| File | Purpose |
|------|---------|
| `ai_workspace/skill_helpers/todo_guide.md` | Skill helper — workflow rules + creation template for all roles |
| `ai_workspace/todos/fix-git-log-truncation.md` | Migrated TODO #1 |
| `ai_workspace/todos/create-todo-skill-helper.md` | Migrated TODO #2 (self-referential — closed by this work) |
| `ai_workspace/todos/restructure-into-per-file-folder.md` | Migrated TODO #4 (self-referential — closed by this work) |
| `ai_workspace/todos/update-project-context-git-model.md` | Migrated TODO #5 |
| `ai_workspace/todos/extract-in-progress-skill-helper.md` | Migrated TODO #6 |

### Modified Files
| File | Change |
|------|--------|
| `AGENTS.md` | Update "Check for todo.md" section to reference the new `todos/` folder and skill helper |
| `ai_workspace/project_context.md` | Update file structure diagram, known issues, and references from `todo.md` to `todos/` system |
| Each role in `ai_workspace/roles/*.md` (7 files) | Add brief cross-reference: "Out-of-scope items → see `skill_helpers/todo_guide.md`" |

### Deleted Files
| File | Reason |
|------|--------|
| `ai_workspace/todo.md` | Replaced by per-file system — migrated and removed |

## Ordered Implementation Steps

1. **Create the skill helper** (`ai_workspace/skill_helpers/todo_guide.md`)
   - Define the todo workflow: how to capture an out-of-scope item, present pending items, track completion.
   - Include a markdown template with fields: Title, Description, Origin (role + date), Context/Notes.
   - Specify folder location (`ai_workspace/todos/`), naming convention, and deletion on completion.

2. **Create `ai_workspace/todos/` directory.**

3. **Migrate the 5 existing todos** from `todo.md` into individual files:
   - `fix-git-log-truncation.md` — TODO #1 (Reviewer, 2026-07-10)
   - `create-todo-skill-helper.md` — TODO #2 (Interviewer, 2026-07-12) → **mark as completed/closed** since this work fulfills it
   - `restructure-into-per-file-folder.md` — TODO #4 (Interviewer, 2026-07-12) → **mark as completed/closed** since this work fulfills it
   - `update-project-context-git-model.md` — TODO #5 (Reviewer, 2026-07-10)
   - `extract-in-progress-skill-helper.md` — TODO #6 (Interviewer, 2026-07-12)

4. **Delete `ai_workspace/todo.md`.**

5. **Update `AGENTS.md`** — replace the "Check for todo.md" reference with instructions to scan `ai_workspace/todos/` and consult the skill helper.

6. **Add cross-references in all 7 role files** (`01_Interviewer.md` through `07_finalizer.md`) — brief note that out-of-scope items should be captured per `skill_helpers/todo_guide.md`.

7. **Update `ai_workspace/project_context.md`** — fix file structure diagram, known issues list, and any stale references to the old `todo.md` model.

8. **Final cleanup step:** Remove the two self-referential completed todos (`create-todo-skill-helper.md`, `restructure-into-per-file-folder.md`) from `ai_workspace/todos/` since they are satisfied by this work.

## Risks and Open Questions
- **No major risks identified.** This is a documentation/orchestration change with no runtime code.
- The two self-referential todos (#2, #4) should be migrated first (for fidelity), then deleted in the final step — ensuring no information loss during migration.
