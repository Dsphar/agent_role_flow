# In-Progress Files Guide

This guide is the single source of truth for `_in_progress.md` file lifecycle — creation, usage, resume-on-restart, and transition-time rename.

## Purpose and Naming Convention

In-progress files provide early notes and progress tracking during a role session. They are temporary and replaced by the corresponding `_complete.md` summary at transition time.

- **Naming:** `{NN}_rolename_in_progress.md` placed in `ai_workspace/`.
- Role names always use **lowercase** (e.g., `03_worker_in_progress.md`, not `03_Worker_in_progress.md`).

## When to Create

### Most Roles — Optional
Any role may optionally create an `_in_progress.md` file during its session for early notes and progress tracking.

### Worker — Mandatory Checklist
The Worker **must** create `03_worker_in_progress.md` with a checklist derived from the ordered implementation steps in `02_planner_complete.md`. Each step starts marked `[ ]`.

## How to Use During a Session

- Jot notes, track progress, and record decisions as you work.
- **Worker-specific:** After completing each plan step, mark it `[x]` with brief notes (files created/modified, deviations from the plan). Document known issues, TODOs, or partial implementations alongside relevant steps.

## Resume-on-Restart Behavior

If a session ends and restarts within the same role:
1. Check for `{NN}_rolename_in_progress.md`.
2. If it exists, **resume from the next incomplete step** (for Worker: next `[ ]` item in the checklist).
3. If it does not exist, start fresh per normal role instructions.

## Transition-Time Rename

When transitioning out of a role (see `transition_guide.md`):
- If `{NN}_rolename_in_progress.md` exists, **rename** it to `{NN}_rolename_complete.md`.
- If it does not exist, create `{NN}_rolename_complete.md` with the full summary.
- Summary filenames always use **lowercase** role names, regardless of how the role skill file is cased (e.g., `06_reviewer_complete.md`).

## "Going Back" Rule

If the user requests reverting to a previous role: **keep any `_in_progress.md`** for that role so work-in-progress is preserved. Do not delete ahead-of-role `_complete.md` files either.
