## Analyze Why Non-Interviewer Roles Reference the TODO Folder

- **Captured by:** Planner (Role 02)
- **Date:** 2026-07-12
- **Context:** User noted that roles other than the Interviewer are scanning and referencing `ai_workspace/TODO/`, but only the Interviewer should be doing so.

## Description

Audit all role skill files and skill helpers to find references to `ai_workspace/TODO/` or "todo" scanning behavior in roles other than the Interviewer. Determine:

1. Which roles currently reference the TODO folder (e.g., in startup checks, transition steps, etc.)
2. Whether those references are intentional design or accidental bleed-in
3. What changes are needed to restrict TODO awareness to only the Interviewer role

## Notes

- The `todo_guide.md` "Presenting Pending Items" section currently instructs **all roles** to scan `ai_workspace/TODO/` at session start — this is likely the source of the issue.
- May also need to check AGENTS.md Role Detection step 6 which directs all roles to scan TODO on startup.
