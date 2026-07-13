## Add skip-documentation prompt to Tester handoff

- **Captured by:** Documenter (Role 05)
- **Date:** 2026-07-12
- **Context:** The user wants the Tester role to proactively offer skipping the documentation step at handoff time. This is a new feature for the pipeline, not something the current Documenter can implement — it requires changes to the Tester's skill file and possibly transition logic.

## Description

Add functionality to the Tester (Role 04) so that when tests pass and the Tester is ready to transition:

1. The Tester asks the user if they want to skip the documentation step for this pipeline loop.
2. If the user says yes/skip:
   - The Tester **preemptively creates `05_documenter_complete.md`** alongside its own `04_tester_complete.md`.
   - The preemptive `05_documenter_complete.md` should note that the user elected to skip documentation this round, with a brief summary of what was built (pulled from prior `_complete.md` files).
   - The Tester then transitions normally — the next role loaded will be Reviewer (Role 06) since Documenter's complete file already exists.

## Notes

- This is an optimization to save a session turn when documentation isn't needed.
- The preemptive `05_documenter_complete.md` should follow the same structure as a normal documenter summary, just with a "skipped" note rather than detailed doc work.
- Consider whether this pattern should be generalized (e.g., could other roles skip future steps too), but for now scope it to Tester → Documenter only.
