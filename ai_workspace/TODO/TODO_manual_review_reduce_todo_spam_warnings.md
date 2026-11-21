## Manual Review — Reduce TODO spam: Warnings send-back, Suggestions one manual-review file

- **Created by:** Reviewer (Role 06)
- **Date:** 2026-11-21
- **Loop goal:** Reduce TODO spam: Warnings send-back, Suggestions one manual-review file

## Items

### 1. Standardize tests/test_sendback.js on the __dirname-based ROOT path pattern
- **Source:** Tester (Role 04)
- **Severity:** Suggestion
- **Description:** `tests/test_sendback.js` reads `"AGENTS.md"` and `path.join(".pi", ...)` relative to process CWD, so it crashes with an uncaught ENOENT when run from inside `tests/`. Every other suite uses the robust `__dirname`-based ROOT pattern (e.g., `test_pipeline_push.js`, `test_todo_consolidation.js`). Standardize Section 9's file reads on that pattern so all suites can be invoked from any working directory.

### 2. Add a dynamic cross-check for doc test counts
- **Source:** Tester (Role 04)
- **Severity:** Suggestion
- **Description:** The W1/W2 send-back findings (stale suite counts in `project_overview.md` and `README.md`) exist because claimed test counts go stale whenever tests are added without a doc update — the "219" claim is accurate today but goes stale on the next suite change. A dynamic cross-check (a test that parses claimed counts from both docs and compares against actual per-suite assertion totals, computed at run time) would prevent recurrence. Do NOT pin literal count strings in a static guard — that just moves the staleness into the test suite.

### 3. project_overview.md File Structure omits tests/test_todo_consolidation.js
- **Source:** Reviewer (Role 06)
- **Severity:** Suggestion
- **Description:** The `tests/` tree in `ai_workspace/project_overview.md` lists five suites but omits `test_todo_consolidation.js` (created this loop; 42 assertions). Incomplete documentation per the doc-tiering rule. Note: Finalizer updates `project_overview.md` each loop and refreshes File Structure on meaningful structural changes — if it adds the entry during finalization, mark this item worked-on/already-addressed at disposition time.
