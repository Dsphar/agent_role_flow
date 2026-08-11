## Make Second Opinion Summary More Forceful

- **Captured by:** Worker (Role 03)
- **Date:** 2026-08-11
- **Context:** Out of scope for Worker — requires modifying the Second Opinion role skill file (`manual_second_opinion.md`). Captured mid-loop per user request.

## Description

Update `ai_workspace/roles/manual_second_opinion.md` so its summary section explicitly instructs each downstream role to address and correct for the problems it identified. Currently, findings are listed but not tied to actionable directives for future roles. The summary should:

1. Call out each finding by number/severity.
2. Explicitly state which target role(s) must act on it (e.g., "Worker (Role 03): you must address Finding #1 and #3 in your implementation").
3. Require downstream roles to acknowledge whether they fixed, deferred, or rejected each assigned finding — not just list them passively.

## Notes

- Target file: `ai_workspace/roles/manual_second_opinion.md`
- This is a meta-improvement to the pipeline itself — should be picked up by Interviewer → Planner → Worker in its own loop.
- Related: Worker already deferred Second Opinion Finding #3 (`agent_end` API verification) without explicitly correcting for it, which highlights why this forcefulness matters.
