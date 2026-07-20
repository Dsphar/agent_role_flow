## Prefer Send-Back on Tester and Reviewer Roles

- **Captured by:** Planner (Role 02)
- **Date:** 2026-07-20
- **Context:** Out-of-scope request during planning phase. User wants pipeline behavior updated so that Tester (Role 04) and Reviewer (Role 06) prefer sending issues back to prior roles rather than deferring them as TODOs, unless the issue is not relevant to the current task being worked on.

## Description

Update the Tester and/or Reviewer role skill files (and any related pipeline guides like `sendback_guide.md` or `AGENTS.md`) so that:

- When Tester or Reviewer encounters an issue in code/work produced by a prior role, **prefer sending it back** to that role for fixing over deferring it as a TODO.
- Exception: if the issue is not relevant to the current task (e.g., pre-existing problems unrelated to this loop's goal), defer or capture as TODO instead of send-back.

This likely involves updating:
- `ai_workspace/roles/04_tester.md` — add preference for send-back over deferral
- `ai_workspace/roles/06_reviewer.md` — same
- Potentially `AGENTS.md` shared constraints section if applicable

## Notes

Check existing send-back logic in `sendback_guide.md` and role files to understand current behavior before making changes.
