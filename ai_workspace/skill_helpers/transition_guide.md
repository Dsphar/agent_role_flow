# Transition Guide

Read this file when completing a role's work and transitioning to the next.

## Transitioning Between Roles

When you believe the current role's work is complete:

### Pre-Handoff Checklist
Before starting the numbered transition steps below, verify each of the following. Skipping items from this checklist risks lost work or broken pipeline state.

- [ ] **All role tasks are complete.** Your deliverables match what your skill file requires. Do not transition early — incomplete work breaks downstream roles.
- [ ] **Summary is written.** You have a clear recap of outcomes and deliverables ready for the `_complete.md` file.
- [ ] **Git commit will be done (Step 5).** This is mandatory unless explicitly skipped by the user. Skipping it means incremental progress is not preserved — prior roles' work in this loop could be lost if something goes wrong later.
- [ ] **Send-back state is handled.** If you are in send-back mode, `send_back.md` has been updated (next role set) or deleted (if you are the original sending role and your work passes).
- [ ] **User will be informed of handoff.** The user should know a new session loads the next role.

1. **Summarize** what was accomplished — clear recap of outcomes and deliverables.
2. **Declare handoff ready.** Inform the user that your work is complete and the next role will load on the next session start. No confirmation prompt needed — transition automatically to step 4.
3. **Mid-transition feedback (optional).** If the user responds with adjustments or corrections before starting a new session, stay in-session and address them. After making changes, return to step 2 and re-declare handoff ready. Do not create an in-progress file for mid-transition tweaks.
4. **Write summary.** Create or update your `_complete.md` file:
   - **Normal mode:** Follow [`skill_helpers/in_progress_guide.md`](in_progress_guide.md) for the rename-from-in-progress logic. In brief: if `{NN}_rolename_in_progress.md` exists, **rename** it to `{NN}_rolename_complete.md`; otherwise create `{NN}_rolename_complete.md` with the full summary. Summary filenames always use **lowercase** role names.
   - **Send-back mode (you are NOT the original sending role):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` — add a `---` divider followed by `## Send-Back Summary`, then your work recap. Do not overwrite the file.
     2. **Update `Current Role:`** in `send_back.md` to point to the next role in the pipeline (e.g., Worker → Tester, Tester → Documenter).
   - **Send-back mode (you ARE the original sending role and your work passes):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` as above.
     2. **Delete `send_back.md`** — the send-back cycle is complete.
5. **Git commit.** This step is mandatory unless explicitly skipped by the user. Skipping it means incremental progress is not preserved — prior roles' work in this loop could be lost if something goes wrong later. Commit all changed files so progress is preserved incrementally:
   1. I run `git status`. If not in a git repo or there are no changes, skip this step silently.
   2. Determine prefix: if you are in send-back mode (`send_back.md` exists now, **or you just deleted it** as the original sending role), use `[ai-{role-name}-sendback]`; otherwise use `[ai-{role-name}]`. Extract `{role-name}` from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`).
   3. I run `git add -A`.
   4. Determine the commit body: read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md`. If it exists, use its content as the body (truncate to <100 chars if needed). If not, generate a concise ad-hoc summary of what was accomplished.
   5. I run `git commit -m "{commit body from step 4} {prefix determined in step 2}"`.
   6. **If the commit fails** (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.
6. **Inform user handoff ready.** Tell the user: "[clear/new]" handoff ready. Start a new session and the next role will load.

### Pre-Creating the Next `_complete.md` Stub
A role may pre-create the next role's `_complete.md` as part of its own completion. This is **Tester-specific behavior**: when tests pass and the user chooses to skip documentation, the Tester creates a minimal `05_documenter_complete.md` stub so the pipeline advances directly to the Reviewer.

**Undoing a pre-created stub:** If the user changes their mind after a role has pre-created the next `_complete.md` (e.g., skipped docs but now wants them), they can delete that stub file before starting the next session. On the next session start, the pipeline will load the correct role since its `_complete.md` no longer exists.

### Pipeline Routing Reference

For pipeline flow and send-back routing details, see [`sendback_guide.md`](./sendback_guide.md#pipeline-and-send-back-routes).
