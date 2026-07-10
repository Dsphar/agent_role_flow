# Transition Guide

Read this file when completing a role's work and transitioning to the next.

## Transitioning Between Roles

When you believe the current role's work is complete:

1. **Summarize** what was accomplished — clear recap of outcomes and deliverables.
2. **Ask** the user if they are satisfied or want adjustments before moving on.
3. Address any requested changes, then re-prompt when ready.
4. Once confirmed:
   - **Normal mode:** If `{NN}_rolename_in_progress.md` exists, **rename** it to `{NN}_rolename_complete.md`. Otherwise, create `{NN}_rolename_complete.md` with the full summary.
   - **Send-back mode (you are NOT the original sending role):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` — add a `---` divider followed by `## Send-Back Summary`, then your work recap. Do not overwrite the file.
     2. **Update `Current Role:`** in `send_back.md` to point to the next role in the pipeline (e.g., Worker → Tester, Tester → Documenter).
   - **Send-back mode (you ARE the original sending role and your work passes):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` as above.
     2. **Delete `send_back.md`** — the send-back cycle is complete.
   - **Git commit:** Commit all changed files so progress is preserved incrementally.
     1. Run `git status`. If not in a git repo or there are no changes, skip this step silently.
     2. Determine prefix: if you are in send-back mode (`send_back.md` exists now, **or you just deleted it** as the original sending role), use `[ai-{role-name}-sendback]`; otherwise use `[ai-{role-name}]`. Extract `{role-name}` from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`).
     3. Run `git add -A`.
     4. Determine the commit body: read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md`. If it exists, use its content as the body (truncate to <100 chars if needed). If not, generate a concise ad-hoc summary of what was accomplished.
     5. Run `git commit -m "{prefix determined in step 2} -- {commit body from step 4}"`.
     6. **If the commit fails** (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.
   - Inform the user that the handoff is ready and instruct them to clear their session so the next role loads on a fresh start via normal startup detection.

### In-Progress Files

Optionally create `{NN}_rolename_in_progress.md` in `ai_workspace/` during a role for early notes. It is temporary and renamed to `_complete.md` upon confirmation.

> **Filename casing note:** Summary filenames (`*_complete.md`, `*_in_progress.md`) always use **lowercase** role names, regardless of how the role skill file is cased (e.g., `06_reviewer_complete.md` not `06_Reviewer_complete.md`).

### Pipeline and Send-Back Routes

```
  ┌──────────┐     ┌──────────┐     ┌─────────┐     ┌────────┐     ┌────────────┐     ┌──────────┐     ┌───────────┐
  │ 01 Inter-│────▶│ 02 Plan-│────▶│ 03 Work-│────▶│ 04 Test-│────▶│ 05 Docu-   │────▶│ 06 Review-│────▶│ 07 Final-  │
  │  viewer  │     │   ner   │     │   er    │     │   er   │     │  menter    │     │   er     │     │   izer     │
  └──────────┘     └────┬─────┘     └────┬────┘     └────────┘     └────────────┘     └────┬─────┘     └───────────┘
                        │                 │                                                   │
                        │          ┌──────┴──────────┐                                        │
                        │          │  Send-back to:   │                                        │
                        │          │  - Planner (02)  │◀───────────────────────────────────────│
                        │          │  - Worker (03)    │                                        │
                        │          └──────────────────┘                                        │
                        │                                                   ┌──────────────────┴──┐
                        │                                                   │  Send-back to:       │
                        │                                                   │  - Planner (02)      │◀──────┐
                        │                                                   │  - Worker (03)        │       │
                        │                                                   └───────────────────────┘       │
                        └───────────────────────────────────────────────────────────────────────────────────┘
```

**Send-back routing summary:**
- **Tester → Planner / Worker:** Test failures can route back to the Planner (design issues) or Worker (implementation bugs).
- **Reviewer → Any prior role:** The Reviewer can send work back to any earlier role in the pipeline via `send_back.md`.
