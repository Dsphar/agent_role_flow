## Goal Summary
Rename project_context to project_overview, narrow scope to stable info only

## What Is Being Changed
- Rename `ai_workspace/project_context.md` → `ai_workspace/project_overview.md`
- Rename `ai_workspace/skill_helpers/project_context_guide.md` → `ai_workspace/skill_helpers/project_overview_guide.md`
- Rewrite both files: remove dynamic content (recent changes, loop history, known issues) and keep only stable sections (architecture, design decisions, file structure, tech stack, user-preferred patterns placeholder)
- Update all references across ~10 files: `AGENTS.md`, all 7 role skill files, `init_project_guide.md`, and one TODO item

## Why It Matters
`project_context.md` has been accumulating transient data (recent changes, loop history, bugs) that belongs in git log or other tracking mechanisms. Narrowing it to a stable overview keeps the file as a reliable architectural reference rather than a changelog.

## Technical Constraints and Preferences
- All references must be updated consistently — no stale `project_context` mentions left behind
- The new guide (`project_overview_guide.md`) should clearly define what belongs vs. doesn't belong so future roles maintain the scope
- No specific user-preferred patterns to bake in yet — leave as a placeholder section

## Edge Cases or Special Considerations
- The Finalizer role has the most references (~8) and handles both creating/updating the file — ensure its instructions align with the new narrower scope
- The init guide's Step 5 creates this file for greenfield projects — template must reflect new structure
- Loop history and recent changes are being discarded entirely (no migration needed per user request)
