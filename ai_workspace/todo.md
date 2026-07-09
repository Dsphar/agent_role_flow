# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.

### Review Finalizer Flow After Per-Role Commits
**Proposed by:** User (via Planner, Loop N 2026-07-09)
**Should be handled by:** Planner → Worker

With incremental git commits now happening at every pipeline stage via AGENTS.md, the Finalizer's own commit/summary behavior should be reviewed. Consider whether the Finalizer needs to avoid duplicate commits, reference existing per-role commits in its recap, or adjust its workflow accordingly.

---


## From Reviewer — Loop 2 Pipeline-Wide Review (2026-07-09)

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
