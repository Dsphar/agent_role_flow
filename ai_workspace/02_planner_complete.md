# 02 — Planner Complete

## Goal Summary
Restrict TODO folder scanning to Interviewer-only [ai-planner]

## Architecture Overview
Two targeted markdown edits to restrict `ai_workspace/TODO/` scanning behavior from all roles to the Interviewer only. No structural or architectural changes needed — purely orchestration file updates.

## File/Module Map
- **Modify:** `AGENTS.md` — remove Role Detection step 6 (unconditional TODO scan) and renumber remaining steps
- **Modify:** `ai_workspace/skill_helpers/todo_guide.md` — rewrite "Presenting Pending Items" section to specify Interviewer-only scanning
- **Delete (Worker):** `ai_workspace/TODO/P2_analyze_todo_folder_access_by_non_interviewer_roles.md` — addressed by this loop

## Ordered Implementation Steps

1. **Edit `AGENTS.md` — Remove step 6 and renumber.** Delete the line: "Scan `ai_workspace/TODO/` for any `.md` files — these are pending out-of-scope items from prior sessions. See `ai_workspace/skill_helpers/todo_guide.md` for the full todo workflow." Renumber steps 7–9 to become steps 6–8.

2. **Edit `todo_guide.md` — Rewrite "Presenting Pending Items" section.** Replace the current section text so it specifies that only the Interviewer scans and presents pending TODOs at session start (per its own skill file instructions). Clarify that other roles retain the ability to capture new TODOs and delete completed ones, but do not proactively scan or present existing items.

3. **Delete addressed TODO file.** Remove `ai_workspace/TODO/P2_analyze_todo_folder_access_by_non_interviewer_roles.md` since this loop addresses it (per `01_interviewer_complete.md`).

## Risks and Open Questions
- **Minimal risk** — both edits are targeted text replacements in markdown files with clear before/after states.
- The Interviewer's skill file (`01_Interviewer.md`) already contains explicit TODO scanning instructions ("Startup — Check for Pending TODO Items"), so no changes to that file are needed.
