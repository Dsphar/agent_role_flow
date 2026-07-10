# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.

### Review Finalizer Flow After Per-Role Commits
**Proposed by:** User (via Planner, Loop N 2026-07-09)
**Should be handled by:** Planner → Worker

With incremental git commits now happening at every pipeline stage via AGENTS.md, the Finalizer's own commit/summary behavior should be reviewed. Consider whether the Finalizer needs to avoid duplicate commits, reference existing per-role commits in its recap, or adjust its workflow accordingly.

---

### Add `--` Separator in Git Commit Messages for Readability
**Proposed by:** User (via Planner, 2026-07-09)
**Should be handled by:** Planner → Worker

Git commit messages currently use format `[ai-{role-name}] summary text`, which can be hard to read. Change the format to `[ai-{role-name}] -- summary text` with a double-dash separator between the prefix and the message body for better visual separation. This affects AGENTS.md transition rules and any role skill files that reference commit message formatting.


## From Reviewer — Loop 2 Pipeline-Wide Review (2026-07-09)

### Handle Partial/Re-Run Loops in Finalizer (Suggestion)
**Proposed by:** Reviewer
**Should be handled by:** Planner → Worker

After a send-back, some `_complete.md` files are deleted and re-created. The Finalizer has no guidance on recognizing that a loop was interrupted and re-run. Add a note to acknowledge send-backs in the final recap if they occurred.


### Finalizer Should Always Reset, Never Offer Wrap-Up
**Proposed by:** User (via Finalizer, 2026-07-09)
**Should be handled by:** Planner → Worker

The Finalizer currently offers the user two paths: reset for a new iteration or wrap up and leave everything as-is. Remove the "wrap up" option — the Finalizer should always perform the two-commit reset flow (summary + delete `_complete.md` files) without asking. The pipeline is designed to loop continuously; if the user truly wants to stop, they can simply not start a new session.

---

### Tester in Send-Back Mode Must Run Full Test Suite
**Proposed by:** User (via Tester, 2026-07-09)
**Should be handled by:** Planner → Worker

When the Tester is in send-back mode and verifies that previously reported bugs are fixed, it should also run a full test suite covering **both** the original work from the first pass **and** the send-back fixes. Currently the Tester's send-back re-run logic only checks whether the specific reported bugs are resolved — it does not mandate re-running all tests to ensure no regressions were introduced by the fix. Update `04_tester.md`'s "Running Again During Send-Back Mode" section to require a complete test run before advancing.


