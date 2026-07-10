# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.

### Review Finalizer Flow After Per-Role Commits
**Proposed by:** User (via Planner, Loop N 2026-07-09)
**Should be handled by:** Planner → Worker

With incremental git commits now happening at every pipeline stage via AGENTS.md, the Finalizer's own commit/summary behavior should be reviewed. Consider whether the Finalizer needs to avoid duplicate commits, reference existing per-role commits in its recap, or adjust its workflow accordingly.


---

### Tester in Send-Back Mode Must Run Full Test Suite
**Proposed by:** User (via Tester, 2026-07-09)
**Should be handled by:** Planner → Worker

When the Tester is in send-back mode and verifies that previously reported bugs are fixed, it should also run a full test suite covering **both** the original work from the first pass **and** the send-back fixes. Currently the Tester's send-back re-run logic only checks whether the specific reported bugs are resolved — it does not mandate re-running all tests to ensure no regressions were introduced by the fix. Update `04_tester.md`'s "Running Again During Send-Back Mode" section to require a complete test run before advancing.


