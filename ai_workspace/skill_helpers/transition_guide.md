# Transition Guide

Read when completing a role's work and transitioning to the next.

## Pre-Handoff Checklist

Verify each before starting numbered steps below. Skipping risks lost work or broken pipeline state.

- [ ] **All role tasks complete.** Deliverables match your skill file requirements. Do not transition early — incomplete work breaks downstream roles.
- [ ] **Summary ready.** Clear recap of outcomes and deliverables prepared for `loop_state.md`.
- [ ] **Git commit will be done (Step 5).** Mandatory unless explicitly skipped by user. Skipping means incremental progress is not preserved — prior roles' work in this loop could be lost.
- [ ] **Send-back state handled.** If in send-back mode: `send_back.md` updated (next role set) or deleted (if you are the original sending role and re-check passes), `(in-sendback)` suffix managed correctly.
- [ ] **User will be informed of handoff.** User should know a new session loads the next role.

## Transition Steps

1. **Summarize** accomplishments — clear recap of outcomes and deliverables.
2. **Declare handoff ready.** Inform user work is complete; next role loads on next session start. No confirmation prompt needed — auto-advance to step 4.
3. **Mid-transition feedback (optional).** If user responds with adjustments before starting a new session, stay in-session and address them. After changes, return to step 2. Do not create an in-progress file for mid-transition tweaks.
4. **Append summary to `loop_state.md`:**

   **a) Append role's summary section** below existing content:
   ```
   ---
   ## {Rolename} (Role NN) — Complete
   {your full summary here}
   ```

   **b) If you have an `_in_progress.md` file, append its contents as a subsection** under your summary above. After appending, **delete** `{NN}_rolename_in_progress.md` — content is now preserved in `loop_state.md`.

   **c) Update handoff history line (line 2).** Move current role to history; next role becomes active:
   ```
   Current Role: {NextRole} (Role NN) | History: {PrevRoles} → {YourRole}<br>
   ```
   Example — Worker → Tester: `Current Role: Tester (Role 04) | History: Interviewer → Planner → Worker<br>`

   **d) Send-back mode transitions:**
   - **Not the original sending role:** Append under `## {Rolename} (Role NN) — Send-Back Summary` header. Update handoff to next role. Keep `(in-sendback)` suffix if cycle continues, remove if advancing past issue.
   - **Original sending role and re-check passes:** Append as above. Remove `(in-sendback)` suffix. **Delete `send_back.md`** — cycle complete.

5. **Git commit.** Mandatory unless explicitly skipped by user. Skipping means incremental progress is not preserved:
   1. Run `git status`. If not in a git repo or no changes, skip silently.
   2. Determine tag: if in send-back mode (`send_back.md` exists now, **or you just deleted it**), use `[ai-{role-name}-sendback]`; otherwise `[ai-{role-name}]`. Extract `{role-name}` from role name (e.g., Worker → `worker`).
   3. Run `git add -A`.
   4. Determine commit body: read `**Goal Summary:**` from line 1 of `loop_state.md`, use as commit body (truncate to <100 chars if needed). If missing, generate concise ad-hoc summary.
   5. Run `git commit -m "{commit body} {tag}"`.
   6. **If commit fails** (identity not configured, merge conflict, etc.), **block transition** — present error to user and ask how to proceed. Do not mark role complete until commit succeeds or user explicitly says to skip.

6. **Inform user handoff ready.** Tell the user: "[clear/new]" handoff ready. Start a new session and the next role will load.

## Pre-Creating the Next Section in `loop_state.md`

A role may pre-create the next role's summary section as part of its own completion. This is **Tester-specific behavior**: when tests pass and user chooses to skip documentation, Tester pre-appends a minimal Documenter section so pipeline advances directly to Reviewer.

**Pre-creating steps:**
1. Append minimal Documenter summary:
   ```
   ---
   ## Documenter (Role 05) — Complete
   Documentation skipped by user at request of Tester. All tests passed; no documentation produced this loop.
   ```
2. Advance handoff line past Documenter to Reviewer:
   ```
   Current Role: Reviewer (Role 06) | History: ... → Tester → Documenter<br>
   ```

**Undoing a pre-created section:** If user changes their mind after a role has pre-created the next section, they can edit `loop_state.md` to remove that appended section and revert the handoff line before starting the next session. Pipeline loads correct role since Documenter no longer has a "Complete" entry in history.

> For line 3 format, parsing rules, mutability rules, and routing matrices, see [Pipeline Configuration](../../AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) in AGENTS.md.

## Pipeline Routing Reference

For pipeline flow and send-back routing details, see [`sendback_guide.md`](./sendback_guide.md#pipeline-and-send-back-routes).
