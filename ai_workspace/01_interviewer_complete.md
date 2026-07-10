# 01 — Interviewer Complete

## Goal Summary
Move transition_guide.md into roles folder

## What Is Being Changed
- Move `ai_workspace/transition_guide.md` to `ai_workspace/roles/transition_guide.md`.
- Update all file references across the codebase so paths remain valid.
- Remove TODO #1 from `ai_workspace/todo.md` once done.

## Why It Matters
Keeps all operational skill/guide files together in one directory for cleaner organization.

## Technical Constraints and Preferences
- All existing references to `transition_guide.md` must be updated (AGENTS.md, role skill files, project context, etc.).
- No behavioral changes — purely a file move + path updates.

## Edge Cases or Special Considerations
- The Planner should audit all files for any hardcoded paths to `ai_workspace/transition_guide.md`.
- TODO #1 origin: `ai_workspace/todo.md` (captured by user, 2026-07-10) — remove upon completion.
