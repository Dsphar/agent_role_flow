## Automatic Handoff After _complete Files

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-13
- **Context:** Currently, after a role writes its `_complete.md` file and commits, it asks the user to confirm before stating "ready for handoff." This adds an extra step — the work is already done at that point. The request is to make this transition more automatic so roles commit and declare handoff ready without waiting for explicit user confirmation when there's nothing left to adjust.

## Description

Modify role behavior (likely in `AGENTS.md` or individual role skill files) so that once a role has:
1. Written its `_complete.md` summary
2. Committed the changes via git

...it automatically declares handoff ready and informs the user to start a new session for the next role — without an intermediate "are you satisfied?" prompt when there are no pending adjustments.

Consider edge cases where the user *does* want adjustments (e.g., "wait, I want to change X before moving on"). The flow could default to auto-handoff but still allow the user to request changes if they respond with feedback rather than proceeding.

## Notes

- This is a UX/process improvement affecting all roles' transition behavior.
- Likely requires changes to `AGENTS.md` (transition section) and possibly individual role files that have explicit "ask user" steps before handoff.
- Related to the broader theme of reducing friction in the pipeline flow.
