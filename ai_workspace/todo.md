# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

### Tester in Send-Back Mode Must Run Full Test Suite
**Proposed by:** User (via Tester, 2026-07-09)

When the Tester is in send-back mode and verifies that previously reported bugs are fixed, it should also run a full test suite covering **both** the original work from the first pass **and** the send-back fixes. Currently the Tester's send-back re-run logic only checks whether the specific reported bugs are resolved — it does not mandate re-running all tests to ensure no regressions were introduced by the fix. Update `04_tester.md`'s "Running Again During Send-Back Mode" section to require a complete test run before advancing.



