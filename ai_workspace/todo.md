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

### Remove Redundant _complete.md Deletion Instruction in Send-Back Flow
**Proposed by:** User (via Tester, 2026-07-09)
**Should be handled by:** Planner → Worker

When the sending role (Tester/Reviewer) completes its re-run and deletes `send_back_to_worker.md`, AGENTS.md instructs it to also delete `_complete.md` files for roles after itself. This is unnecessary — since the send-back halts the pipeline at the sending role, no downstream roles have run yet, so those `_complete.md` files will never exist. The instruction can be removed from both AGENTS.md and the relevant role skill files.

### Include Planner in Send-Back Cycle
**Proposed by:** User (via Worker, 2026-07-09)
**Should be handled by:** Planner → Worker

The current send-back flow routes issues back to the Worker (Role 03), skipping the Planner. But some critical issues — especially architectural or design-level problems found by the Reviewer — may require plan changes before re-implementing. Consider whether the send-back cycle should sometimes start at the Planner instead of the Worker, and how to decide which entry point is appropriate.

---

### Finalizer Should Always Reset, Never Offer Wrap-Up
**Proposed by:** User (via Finalizer, 2026-07-09)
**Should be handled by:** Planner → Worker

The Finalizer currently offers the user two paths: reset for a new iteration or wrap up and leave everything as-is. Remove the "wrap up" option — the Finalizer should always perform the two-commit reset flow (summary + delete `_complete.md` files) without asking. The pipeline is designed to loop continuously; if the user truly wants to stop, they can simply not start a new session.

---

### Simplify Send-Back Advancement — Always Advance to Next Role Only
**Proposed by:** User (via Tester, 2026-07-09)
**Should be handled by:** Planner → Worker

Each role in send-back mode should ONLY advance `Current Role:` to the role immediately after itself. Never skip ahead based on who the original sender is.

Currently:
- **Worker (Role 03)** checks who sent it back and sets `Current Role:` accordingly — Tester sends back → points to Tester; Reviewer sends back → points to Summarizer (skipping Tester).
- This requires every role to know who the sender is, adding complexity.

Proposed:
- Every role simply advances to the next sequential role. Worker always → Tester, Tester always → Summarizer, etc.
- No role needs to consider `Source:` — the workflow plays out naturally through single-step advancement.
- Update AGENTS.md send-back transition rules and all affected role skill files (Worker, Tester, Reviewer) to remove sender-aware logic.
