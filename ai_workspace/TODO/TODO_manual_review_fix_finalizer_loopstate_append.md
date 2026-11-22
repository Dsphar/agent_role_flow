## Manual Review — Fix Finalizer loop_state append conflict and add /pipeline-cleanup command

- **Created by:** Reviewer (Role 06)
- **Date:** 2026-11-21
- **Loop goal:** Fix Finalizer loop_state append conflict and add /pipeline-cleanup command

## Items

### 1. Extract small shared runner helpers in `.pi/extensions/pipeline-auto.ts`
- **Source:** Reviewer (Role 06)
- **Severity:** Suggestion
- **Description:** `handler` (lines 748–753, 781–798) and `cleanupHandler` (lines 979–984, 1081–1098) duplicate the 100ms delayed terminal clear promise and the `STUCK_THRESHOLD` consecutive-same-role history check. Extracting tiny internal helpers (e.g., `clearTerminalDelayed()` and `isRoleStuck()`) would reduce duplication while keeping both command handlers concise and readable.

### 2. Polish test harness timeout guard and unused variable in `tests/test_pipeline_cleanup.js`
- **Source:** Reviewer (Role 06)
- **Severity:** Suggestion
- **Description:** In `C12a` (lines 812–820), `steerPromise` polls `capturedLogs` via `setInterval` without a bounded timeout fallback, so a future regression where `"Interviewer inspecting TODOs"` is never logged would hang the test instead of failing fast. Additionally, the `steerReceived` local variable in the fake RPC child (lines 73, 92) is assigned but never read or asserted.
