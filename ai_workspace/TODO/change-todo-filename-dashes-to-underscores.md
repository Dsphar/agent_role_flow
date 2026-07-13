## Change TODO Filename Convention from Dashes to Underscores

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-07-12
- **Context:** The current todo naming convention uses kebab-case (dashes), e.g., `create-project-context-guide.md`. The user prefers underscores instead, e.g., `create_project_context_guide.md`.

## Description

Update the TODO filename convention from dashes to underscores:

1. Rename existing `.md` files in `ai_workspace/TODO/` from kebab-case to underscore-separated names.
2. Update `skill_helpers/todo_guide.md` to reflect the new naming convention (change any examples and guidance referencing dashes).
3. Check for any other references to the dash-based naming pattern across role files or guides and update accordingly.

## Notes

- This is a cosmetic/consistency change — no functional impact beyond filenames.
- The `todo_guide.md` currently says "short, kebab-case" in step 3 of the capture instructions.
