# In-Progress Files Guide

Single source of truth for `_in_progress.md` lifecycle — creation, usage, resume-on-restart, and transition-time handling.

## Naming Convention

- **Format:** `{NN}_rolename_in_progress.md` in `ai_workspace/`. Role names always **lowercase** (e.g., `03_worker_in_progress.md`).
- Temporary files — content incorporated into `loop_state.md` at transition time.

## When to Create

### Most Roles — Optional
Any role may create an `_in_progress.md` file for early notes and progress tracking.

### Worker — Mandatory Checklist
Worker **must** create `03_worker_in_progress.md` with a checklist from the Planner's ordered steps in `loop_state.md`. Each step starts `[ ]`.

## Usage During Session

- Jot notes, track progress, record decisions.
- **Worker-specific:** After each plan step, mark `[x]` with brief notes (files created/modified, deviations, blockers).

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
