# 02 — Planner Complete

## Goal Summary
Update `ai_workspace/roles/07_finalizer.md` to explicitly instruct the Finalizer to source its short commit description from the `## Goal Summary` section of `01_interviewer_complete.md`, rather than composing its own.

## Architecture Overview
Single-file edit to `07_finalizer.md`. No structural or dependency changes. The instruction is added within the existing "Loop Reset and Handoff" section where the commit message format is already defined.

## File/Module Map
- **Modify:** `ai_workspace/roles/07_finalizer.md` — add sourcing instruction + fallback for missing Interviewer summary.
- **Modify:** `ai_workspace/todo.md` — remove completed TODO item.

## Ordered Implementation Steps
1. In `07_finalizer.md`, update step 2 under "Loop Reset and Handoff" to instruct the Finalizer to source `<short description>` from the `## Goal Summary` section of `01_interviewer_complete.md`.
2. Add a fallback: if `01_interviewer_complete.md` doesn't exist, the Finalizer should compose its own short description (or ask the user).
3. Remove the completed TODO item "Finalizer: Use Interviewer Summary for Commit Message" from `ai_workspace/todo.md`.

## Risks and Open Questions
- None significant. The change is a single instruction addition to an existing section. No ambiguity detected.
