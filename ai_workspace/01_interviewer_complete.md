# 01 — Interviewer Complete

## Problem Statement: Add Git Commits at Every Pipeline Stage

Add automated git commits after every role completes its work in the pipeline. This ensures progress is preserved incrementally rather than only at Finalizer.

### Requirements
- **When:** After each role saves its `_complete.md` file (during the "Transitioning Between Roles" step in `AGENTS.md`)
- **Scope:** All 7 roles commit, including no-op roles that simply record they had nothing to do
- **Commit message format:** `[ai-{role-name}] {up to 100 char summary of what was accomplished}`
- **Send-back commits:** Use `[ai-{role-name}-sendback]` prefix when a role completes after being sent back from Tester/Reviewer
- **What gets committed:** All changed files (project root + `ai_workspace/`), respecting `.gitignore` if present
- **Where the logic lives:** In `AGENTS.md` under the transition section, so every role follows it automatically

### Origin
This addresses TODO item "Git Commits at Every Pipeline Stage" from `ai_workspace/todo.md`. The Planner should include a step to remove this completed TODO item.
