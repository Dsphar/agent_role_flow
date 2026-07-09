# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.

---

## Pending

### CHange bname of sumamrizer to documenter

### Guardrail Enforcement Fix (from Reviewer, loop 1)
**Proposed by:** User + Reviewer  
**Should be handled by:** Planner → Worker  

The Reviewer broke its own guardrails during the first pipeline loop by directly editing `01_interviewer.md` instead of flagging it for later execution.

**Root cause:** No way to capture user-requested work that falls outside the current role's scope. The agent defaults to "being helpful" and just does it.

**Proposed fix:**
1. Create `ai_workspace/todo.md` — a shared task list where any role can dump out-of-scope requests, noting which role should handle each item. *(Done)*
2. Strengthen guardrails across all roles to explicitly say: *"If the user requests something outside your scope, add it to `ai_workspace/todo.md` and note which role should handle it. Do not do it yourself."*
3. Add a "TODO Check" step to Session Startup in AGENTS.md — on every session start, check if `todo.md` has items and ask the user whether to address them before proceeding.

**Note:** The user intends to make adjustments to this proposal themselves before handing it off for implementation.

### Investigate More Git Usage (from Interviewer, loop 2)
**Proposed by:** User
**Should be handled by:** Planner → Worker

Explore deeper git integration in the pipeline — e.g., branching strategies per iteration, commit conventions enforced by roles, using `git diff` earlier in the pipeline (not just at Version Controller), or other git-driven workflow improvements.

### Interviewer Suggests Work Items from TODO (from Interviewer, loop 2)
**Proposed by:** User
**Should be handled by:** Planner → Worker

Consider having the Interviewer read `ai_workspace/todo.md` during Session Startup and suggest pending items as possible work to tackle. This would surface deferred tasks naturally instead of leaving them buried in a file.

---

## From Reviewer — Loop 2 Pipeline-Wide Review (2026-07-09)

### Consolidate Send-Back Cleanup Logic (Warning)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

Send-back cleanup instructions are duplicated between AGENTS.md and `03_worker.md`. If one changes and the other doesn't, they'll drift apart. Pick a single source of truth — either keep details in Worker only with a pointer from AGENTS.md, or vice versa.

### Add Non-Code Iteration Guidance to Reviewer (Warning)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

The Reviewer's tasks are all code-focused. On infrastructure-only iterations (no application code), there's no guidance on how to adapt. Add a note: "If this iteration produced only configuration/documentation changes, focus your review on those artifacts and skip code-specific sections, noting why in your report."

### Make Send-Back Mechanism Visible in Tester Role (Suggestion)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

The Tester can create `send_back_to_worker.md`, but the instruction is buried inside "Execute Tests and Report Results" with no dedicated subsection. The Reviewer has a clear "Auto Send-Back on Critical Issues" section. Add a matching subsection to the Tester for symmetry so agents don't miss the option.

### Handle Partial/Re-Run Loops in Finalizer (Suggestion)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

After a send-back, some `_complete.md` files are deleted and re-created. The Finalizer has no guidance on recognizing that a loop was interrupted and re-run. Add a note to acknowledge send-backs in the final recap if they occurred.

### Validate Complete Role Chain on Startup (Suggestion)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

Role Detection step 3 finds "the first role whose `_complete.md` does not exist" but doesn't verify all *prior* roles are present. If a file is accidentally deleted mid-pipeline, the agent silently skips ahead past the gap. Add: "If any role before the current one is also missing its `_complete.md`, warn the user and ask whether to start from the earliest missing role instead."

### Add Non-Code Iteration Guidance to Summarizer (Suggestion)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

The Summarizer's "Review Inline Code Documentation" task assumes application code exists. On config-only iterations this is a dead end with no fallback guidance. Add the same non-code iteration note as proposed for the Reviewer.
