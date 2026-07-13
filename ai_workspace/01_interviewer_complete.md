## Goal Summary

Audit init guide and add TODO proposal step + new todos for context guide and filename convention [ai-interviewer]

## What Was Done

- **Added Step 6 to `init_project_guide.md`** — After creating `project_context.md`, the init guide now analyzes the project and proposes optional improvement items across four categories: stale/dead code, anti-patterns, incomplete functionality, and suggested enhancements. Accepted items become `TODO/` files; declined ones are dropped.
- **Created TODO item:** `create-project-context-guide.md` — Extract a canonical `project_context_guide.md` skill helper for the init guide and finalizer role to use when creating/updating `project_context.md`.
- **Created TODO item:** `change-todo-filename-dashes-to-underscores.md` — Rename existing TODO files from kebab-case to underscore-separated naming and update all references.

## Deliverables

- Modified: `ai_workspace/skill_helpers/init_project_guide.md` (new Step 6)
- Created: `ai_workspace/TODO/create-project-context-guide.md`
- Created: `ai_workspace/TODO/change-todo-filename-dashes-to-underscores.md`
