# Transition Guide

Read this file when completing a role's work and transitioning to the next.

## Transitioning Between Roles

When you believe the current role's work is complete:

### Pre-Handoff Checklist
Before starting the numbered transition steps below, verify each of the following. Skipping items from this checklist risks lost work or broken pipeline state.

- [ ] **All role tasks are complete.** Your deliverables match what your skill file requires. Do not transition early — incomplete work breaks downstream roles.
- [ ] **Summary is ready.** You have a clear recap of outcomes and deliverables ready to append to `loop_state.md`.
- [ ] **Git commit will be done (Step 5).** This is mandatory unless explicitly skipped by the user. Skipping it means incremental progress is not preserved — prior roles' work in this loop could be lost if something goes wrong later.
- [ ] **Send-back state is handled.** If you are in send-back mode, `send_back.md` has been updated (next role set) or deleted (if you are the original sending role and your work passes), and the `(in-sendback)` suffix in `loop_state.md` is correctly managed.
- [ ] **User will be informed of handoff.** The user should know a new session loads the next role.

1. **Summarize** what was accomplished — clear recap of outcomes and deliverables.
2. **Declare handoff ready.** Inform the user that your work is complete and the next role will load on the next session start. No confirmation prompt needed — transition automatically to step 4.
3. **Mid-transition feedback (optional).** If the user responds with adjustments or corrections before starting a new session, stay in-session and address them. After making changes, return to step 2 and re-declare handoff ready. Do not create an in-progress file for mid-transition tweaks.
4. **Append your summary to `loop_state.md`.** Update the shared state file:

   **a) Append your role's summary section.** Add a divider and header below the existing content:
   ```
   ---
   ## {Rolename} (Role NN) — Complete
   {your full summary here}
   ```

   **b) If you have an `_in_progress.md` file, append its contents as a subsection** under your summary section above, before updating the handoff line:
   ```
   ### In-Progress Notes
   {contents of {NN}_rolename_in_progress.md}
   ```
   After appending, **delete** `{NN}_rolename_in_progress.md` — its content is now preserved in `loop_state.md`.

   **c) Update the handoff history line (line 2).** Your current role gets moved to the history; the next role becomes active. Format:
   ```
   Current Role: {NextRole} (Role NN) | History: {PrevRoles} → {YourRole}<br>
   ```
   Example — Worker transitioning to Tester:
   ```
   Before:  Current Role: Worker (Role 03) | History: Interviewer → Planner<br>
   After:   Current Role: Tester (Role 04) | History: Interviewer → Planner → Worker<br>
   ```

   **d) Send-back mode transitions:**
   - **You are NOT the original sending role:** Append your send-back summary under a `## {Rolename} (Role NN) — Send-Back Summary` header instead of `— Complete`. Update handoff line to point to next role. Keep `(in-sendback)` suffix on the active role if the cycle continues, or remove it if you are advancing past the issue.
   - **You ARE the original sending role and your re-check passes:** Append your send-back summary as above. Remove `(in-sendback)` suffix from handoff line. **Delete `send_back.md`** — the send-back cycle is complete.

5. **Git commit.** This step is mandatory unless explicitly skipped by the user. Skipping it means incremental progress is not preserved — prior roles' work in this loop could be lost if something goes wrong later. Commit all changed files so progress is preserved incrementally:
   1. Run `git status`. If not in a git repo or there are no changes, skip this step silently.
   2. Determine tag: if you are in send-back mode (`send_back.md` exists now, **or you just deleted it** as the original sending role), use `[ai-{role-name}-sendback]`; otherwise use `[ai-{role-name}]`. Extract `{role-name}` from your current role name (e.g., Worker → `worker`).
   3. Run `git add -A`.
   4. Determine the commit body: read `**Goal Summary:**` from line 1 of `loop_state.md`. Use its value as the commit body (truncate to <100 chars if needed). If it does not exist, generate a concise ad-hoc summary of what was accomplished.
   5. Run `git commit -m "{commit body from step 4} {tag determined in step 2}"`.
   6. **If the commit fails** (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.
6. **Inform user handoff ready.** Tell the user: "[clear/new]" handoff ready. Start a new session and the next role will load.

### Pre-Creating the Next Section in `loop_state.md`
A role may pre-create the next role's summary section in `loop_state.md` as part of its own completion. This is **Tester-specific behavior**: when tests pass and the user chooses to skip documentation, the Tester pre-appends a minimal Documenter section so the pipeline advances directly to the Reviewer.

**Pre-creating steps:**
1. Append a minimal Documenter summary:
   ```
   ---
   ## Documenter (Role 05) — Complete
   Documentation skipped by user at request of Tester. All tests passed; no documentation produced this loop.
   ```
2. Advance the handoff line past Documenter to Reviewer:
   ```
   Current Role: Reviewer (Role 06) | History: ... → Tester → Documenter<br>
   ```

**Undoing a pre-created section:** If the user changes their mind after a role has pre-created the next section in `loop_state.md` (e.g., skipped docs but now wants them), they can edit `loop_state.md` to remove that appended section and revert the handoff line before starting the next session. On the next session start, the pipeline will load the correct role since Documenter no longer has a "Complete" entry in the history.

### Pipeline Configuration (Line 3 of `loop_state.md`)

Line 3 of `loop_state.md` is the **global mutable pipeline config line**. It stores key-value pairs that all downstream roles read at startup:
```
skip_docs={yes|no} | test_level={quick|deep|skip}<br>
```

> Lines 1–3 end with `<br>` so they render on separate visual lines in markdown viewers. Strip trailing `<br>` when parsing values.

**Setting values:** The Planner sets initial values during its "Ask Pipeline Configuration Questions" task. If line 3 already has content, append new keys or update existing ones.

**Reading values:** Any role that depends on pipeline config (Tester, Documenter) should check line 3 at startup before asking the user. Pre-set values take precedence over mid-pipeline prompts.

**Mutability rules:** Any downstream role can update line 3 if the user changes their mind during that role's session. The updating role **must**:
1. Update the relevant key-value pair on line 3.
2. Note the change in its summary section appended to `loop_state.md` (e.g., "User changed skip_docs from yes to no mid-session").
3. Recalculate its handoff target from the routing matrix below if needed.

**Routing Matrix — Worker Handoff Targets:**
| skip_docs | test_level | Worker hands off to |
|-----------|------------|---------------------|
| no        | deep       | Tester → Documenter (existing flow) |
| no        | quick      | Tester → Documenter (Tester adjusts scope) |
| no        | skip       | Documenter          |
| yes       | deep       | Tester → Reviewer   |
| yes       | quick      | Tester → Reviewer   |
| yes       | skip       | Reviewer            |

**Routing Matrix — Tester Handoff Targets:**
| skip_docs | test_level | Tester hands off to |
|-----------|------------|---------------------|
| no        | deep/quick | Documenter (Role 05) |
| yes       | deep/quick | Reviewer (Role 06) — advance past Documenter |

### Pipeline Routing Reference

For pipeline flow and send-back routing details, see [`sendback_guide.md`](./sendback_guide.md#pipeline-and-send-back-routes).
