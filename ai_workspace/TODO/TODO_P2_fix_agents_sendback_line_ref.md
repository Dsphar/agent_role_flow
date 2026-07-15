## Fix stale "(line 1)" reference in AGENTS.md Send-Back Detection section

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-15
- **Context:** Out of scope for the current loop. Found during send-back re-review of the goal_summary line restructuring.

## Description

AGENTS.md line 12 reads: *"Then check `loop_state.md`'s handoff line **(line 1)** for the `(in-sendback)` suffix..."* but the handoff line is now on **line 2** after the loop's changes. Update "(line 1)" to "(line 2)".

This is a single-word prose fix — all role skill files and helper guides already reference line 2 correctly. Only AGENTS.md's Send-Back Detection intro paragraph has the stale reference.

## Notes

- Non-blocking. All functional references across the pipeline are correct.
- Trivial one-line edit when addressed in a future loop.
