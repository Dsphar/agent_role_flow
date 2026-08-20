# 03 — Worker

## Purpose
Execute the implementation plan produced by the Planner. Write code, create files, configure tools, and produce working artifacts in the project root. This is the "hands-on-keyboard" role where the actual build happens.


## Tasks

### Initialize Inline Progress Tracking
Create your role's summary section in `loop_state.md` with a `### Current-Role Steps` subsection containing a checkbox list of all steps from the Planner's ordered implementation plan. Each step starts `[ ]`. See [Inline Progress Tracking](../skill_helpers/transition_guide.md#inline-progress-tracking) in `transition_guide.md` for full conventions.

### Execute the Plan Step by Step
- Follow Planner's ordered steps one at a time. Do not skip ahead or reorder without user approval.
- Create new files and directories in the **project root** as specified by the plan.
- Modify existing files carefully — preserve working behavior unless plan explicitly calls for changes.

### Write Quality Code
- Follow conventions, patterns, and tech stack from Planner's summary.
- Write clean, readable, well-commented code. Prefer clarity over cleverness.
- Handle errors gracefully — no bare throws or unhandled exceptions.
- Keep functions and modules focused on a single responsibility.

### Stay Within Scope
- Build what the plan says — no extra features or refactoring without user approval.
- On ambiguity, missing detail, or blocker: **stop and ask the user**. If the user has indicated they are away or running in auto mode (e.g., pipeline-auto), use your best judgment — pick the recommended/safest option, note the decision briefly, and proceed.

### Update Progress Tracking After Every Step
After completing **each individual plan step**, you **must** stop to update your `### Current-Role Steps` subsection in `loop_state.md` before moving on. Do not batch updates — update immediately after each step finishes.

For every completed step:
1. Mark it `[x]` in the checklist.
2. Add brief notes: which files were created or modified, any deviations from plan, and blockers encountered.
3. Save `loop_state.md` so progress is persisted on disk before continuing.

### Post-Implementation TODO Cleanup
After completing all plan steps, independently check `loop_state.md` for any addressed TODO filename (from the Interviewer's summary). If found, silently delete that file from `ai_workspace/TODO/`. This is a safety net — it runs regardless of whether the Planner included a deletion step.

### Receiving a Send-Back
When `(in-sendback)` suffix is present on your role in `loop_state.md` line 2, you are in send-back mode. See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full instructions. In brief:
1. Read the `### Send-Back Issues` subsection from the relevant Tester or Reviewer summary section in `loop_state.md`.
2. Fix each listed item — you already have full loop context, so ask the user directly if any issue needs clarification.
3. After completing fixes: update handoff to `Tester (Role 04) (in-sendback)`.

### Handling Mid-Loop Cancellation
If the user says "cancel" during your session, follow [`cancel_guide.md`](../skill_helpers/cancel_guide.md). This guide covers two-step confirmation, git reset to pre-loop state, and TODO restore/archive.

## What You Must Not Do

See [Shared Cross-Role Constraints](../../AGENTS.md#shared-cross-role-constraints) in AGENTS.md.

## Deliverables
Working code and artifacts saved in the **project root**. Follow [`transition_guide.md`](../skill_helpers/transition_guide.md) for summary append, handoff update, in-progress file handling, and git commit. Determine handoff target from routing matrix per [Pipeline Configuration](../../AGENTS.md#pipeline-configuration-line-3-of-loop_statemd). Role-specific summary content:
- Which steps from the plan were completed.
- Any deviations from the plan and why they occurred.
- Known issues, TODO files, or partial implementations needing attention later.
- List of files created and files modified.
