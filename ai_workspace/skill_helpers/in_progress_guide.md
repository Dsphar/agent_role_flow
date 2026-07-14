# In-Progress Files Guide

This guide is the single source of truth for `_in_progress.md` file lifecycle — creation, usage, resume-on-restart, and transition-time handling.

## Purpose and Naming Convention

In-progress files provide early notes and progress tracking during a role session. They are temporary and their content is incorporated into `loop_state.md` at transition time.

- **Naming:** `{NN}_rolename_in_progress.md` placed in `ai_workspace/`.
- Role names always use **lowercase** (e.g., `03_worker_in_progress.md`, not `03_Worker_in_progress.md`).

## When to Create

### Most Roles — Optional
Any role may optionally create an `_in_progress.md` file during its session for early notes and progress tracking.

### Worker — Mandatory Checklist
The Worker **must** create `03_worker_in_progress.md` with a checklist derived from the ordered implementation steps in the Planner's section of `loop_state.md`. Each step starts marked `[ ]`.

## How to Use During a Session

- Jot notes, track progress, and record decisions as you work.
- **Worker-specific:** After completing each plan step, mark it `[x]` with brief notes (files created/modified, deviations from the plan). Document known issues, TODOs, or partial implementations alongside relevant steps.

## Resume-on-Restart Behavior

If a session ends and restarts within the same role:
1. Check for `{NN}_rolename_in_progress.md`.
2. If it exists, **resume from the next incomplete step** (for Worker: next `[ ]` item in the checklist).
3. If it does not exist, start fresh per normal role instructions.

## Transition-Time Handling

When transitioning out of a role (see `transition_guide.md`):

- If `{NN}_rolename_in_progress.md` exists, **append its contents as an "In-Progress Notes" subsection** under your role's summary section in `loop_state.md`. Format:
  ```
  ### In-Progress Notes
  {contents of the _in_progress.md file}
  ```
  After appending, **delete** `{NN}_rolename_in_progress.md` — its content is now preserved in `loop_state.md`.

- If no `_in_progress.md` exists, skip this step. Your role's summary section in `loop_state.md` stands on its own.

## "Going Back" Rule

If the user requests reverting to a previous role: **keep any `_in_progress.md`** for that role so work-in-progress is preserved. Revert the handoff line in `loop_state.md` to point back to the target role (removing any roles after it from the history). Do not delete summary sections from roles ahead of the target either — they remain as reference.
