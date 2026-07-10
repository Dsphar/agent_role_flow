# 01 — Interviewer Complete

## Goal Summary
Finalizer uses Interviewer goal summary for commit message

## What Is Being Changed
Update `ai_workspace/roles/07_finalizer.md` to explicitly instruct the Finalizer to source its short commit description from the `## Goal Summary` section of `01_interviewer_complete.md`, rather than composing its own.

## Why It Matters
- Keeps commit messages consistent with how work was originally scoped at the start of each pipeline loop.
- Prevents the Finalizer from inventing or paraphrasing a summary that may differ from the user's intent.

## Technical Constraints and Preferences
- Only `07_finalizer.md` needs to be modified for this change.
- The instruction should go in the "Loop Reset and Handoff" section where the commit message format is defined.
- No changes needed to other role files or `transition_guide.md`.

## Edge Cases or Special Considerations
- If `01_interviewer_complete.md` does not exist for some reason, the Finalizer should fall back to composing its own short description (or ask the user).

## Origin
Addressed TODO item: "Finalizer: Use Interviewer Summary for Commit Message" from `ai_workspace/todo.md`.
