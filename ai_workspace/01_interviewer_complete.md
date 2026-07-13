# 01 — Interviewer Complete

## Goal Summary
Restrict TODO folder scanning to Interviewer-only [ai-interviewer]

## What Is Being Changed
Two files that currently instruct **all roles** to scan and present `ai_workspace/TODO/` items at startup need to be narrowed so only the Interviewer does this:

1. **`AGENTS.md` — Role Detection step 6:** Remove or restrict the TODO scanning instruction so it applies only to the Interviewer role.
2. **`ai_workspace/skill_helpers/todo_guide.md` — "Presenting Pending Items" section:** Narrow the startup scan instruction to specify that only the Interviewer presents pending TODOs at session start.

## Why It Matters (Goals / Success Criteria)
- Non-Interviewer roles currently present TODO items to users at every role transition, which is noisy and violates the design intent that TODO awareness belongs to the Interviewer.
- **Done when:** Only the Interviewer scans and presents `ai_workspace/TODO/` contents on startup. All other roles retain their ability to *capture* new out-of-scope items as TODOs but no longer proactively scan or present existing ones.

## Technical Constraints and Preferences
- This is a meta-fix to the pipeline orchestration files (markdown only, no code).
- Do not remove any role's ability to *create* TODO files for out-of-scope requests — that behavior is correct and universal.
- The Planner's reference to checking if a TODO was addressed (for Worker deletion handoff) should remain untouched.

## Edge Cases or Special Considerations
- The `todo_guide.md` "Presenting Pending Items" section is referenced by all roles indirectly via AGENTS.md step 6. Even after removing AGENTS.md step 6, the guide itself should be clarified so a future agent reading it doesn't assume universal scanning behavior.

## TODO Addressed
This session addressed `P2_analyze_todo_folder_access_by_non_interviewer_roles.md`. The Worker should delete this file upon completion.
