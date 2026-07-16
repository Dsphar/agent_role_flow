## Instructions for cancelling a TODO/work mid-loop

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-07-15
- **Context:** Currently there are no documented instructions for how to cancel or abort work after its pipeline loop has already started. If a user changes their mind mid-loop, it's unclear what should happen — does the current role stop? Does `loop_state.md` get cleaned up? What about partial commits?

## Description

Add specific instructions across the relevant workflow files for cancelling/aborting work that is already in progress:
- Define what happens when a user says "cancel" or "stop this work" mid-loop.
- Cover cleanup of `loop_state.md`, any partial artifacts, and git state (partial commits).
- Decide whether the pipeline resets fully or gracefully stops at the current role boundary.
- Determine if the originating TODO file should be restored (if it was deleted upon loop start) or marked as cancelled rather than completed.
- Update whichever files are relevant — likely `transition_guide.md`, `todo_guide.md`, and possibly `AGENTS.md` for cross-role awareness.

## Notes

- This is a workflow/orchestration concern, not a code feature. It affects how the pipeline handles user-initiated cancellation.
- Consider edge cases: cancelling at Role 01 (easy, just reset) vs. cancelling at Role 05+ (code written, tests passing, docs done — more cleanup needed).
- May want to distinguish between "cancel this loop" and "cancel this TODO entirely" (don't revisit it later).
