# Transition Guide

Read this file when completing a role's work and transitioning to the next.

## Transitioning Between Roles

When you believe the current role's work is complete:

1. **Summarize** what was accomplished — clear recap of outcomes and deliverables.
2. **Ask** the user if they are satisfied or want adjustments before moving on.
3. Address any requested changes, then re-prompt when ready.
4. Once confirmed:
   - **Normal mode:** Follow [`skill_helpers/in_progress_guide.md`](in_progress_guide.md) for the rename-from-in-progress logic. In brief: if `{NN}_rolename_in_progress.md` exists, **rename** it to `{NN}_rolename_complete.md`; otherwise create `{NN}_rolename_complete.md` with the full summary. Summary filenames always use **lowercase** role names.
   - **Send-back mode (you are NOT the original sending role):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` — add a `---` divider followed by `## Send-Back Summary`, then your work recap. Do not overwrite the file.
     2. **Update `Current Role:`** in `send_back.md` to point to the next role in the pipeline (e.g., Worker → Tester, Tester → Documenter).
   - **Send-back mode (you ARE the original sending role and your work passes):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` as above.
     2. **Delete `send_back.md`** — the send-back cycle is complete.
   - **Git commit:** Commit all changed files so progress is preserved incrementally.
     1. I run `git status`. If not in a git repo or there are no changes, skip this step silently.
     2. Determine prefix: if you are in send-back mode (`send_back.md` exists now, **or you just deleted it** as the original sending role), use `[ai-{role-name}-sendback]`; otherwise use `[ai-{role-name}]`. Extract `{role-name}` from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`).
     3. I run `git add -A`.
     4. Determine the commit body: read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md`. If it exists, use its content as the body (truncate to <100 chars if needed). If not, generate a concise ad-hoc summary of what was accomplished.
     5. I run `git commit -m "{commit body from step 4} {prefix determined in step 2}"`.
     6. **If the commit fails** (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.
   - Inform user: "[clear/new]" handoff ready. Start a new session and the next role will load.

### Pre-Creating the Next `_complete.md` Stub
A role may pre-create the next role's `_complete.md` as part of its own completion. This is **Tester-specific behavior**: when tests pass and the user chooses to skip documentation, the Tester creates a minimal `05_documenter_complete.md` stub so the pipeline advances directly to the Reviewer.

**Undoing a pre-created stub:** If the user changes their mind after a role has pre-created the next `_complete.md` (e.g., skipped docs but now wants them), they can delete that stub file before starting the next session. On the next session start, the pipeline will load the correct role since its `_complete.md` no longer exists.

### Pipeline and Send-Back Routes

```
  ┌──────────┐     ┌──────────┐     ┌─────────┐     ┌────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
  │ 01 Inter-│────▶│ 02 Plan-│────▶│ 03 Work-│────▶│ 04 Test-│────▶│ 05 Docu-   │────▶│ 06 Review-│────▶│ 07 Final-  │
  │  viewer  │     │   ner   │     │   er    │     │   er   │     │  menter    │     │   er     │     │   izer     │
  └──────────┘     └────┬─────┘     └────────┘     └────┬───┘     └────────────┘     └────┬─────┘     └───────────┘
                        │                                │                                   │
                  ┌─────┴──────┐                         │                          ┌────────┴──────┐
                  │Send-back to│                         │                          │Send-back to   │
                  │- Planner   │◀────────────────────────┤                          │- Planner      │◀──────┐
                  │  (02)      │                         │                          │  (02)         │       │
                  └────────────┘                         │                          └───────────────┘       │
                        └───────────────────────────────────────────────────────────────────────────────────┘
```

**Send-back routing summary:**
- **Tester → Planner:** Test failures route back to the Planner for re-planning.
- **Reviewer → Planner:** Critical review findings route back to the Planner for re-planning.
