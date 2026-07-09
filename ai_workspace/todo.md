# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.


### Git Commits at Every Pipeline Stage
**Proposed by:** User
**Should be handled by:** Planner → Worker

Explore adding git commits at critical stages of the role pipeline, not just in the Finalizer. Consider committing after each role completes (or at key milestones) so that progress is preserved incrementally rather than only at the very end.

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
