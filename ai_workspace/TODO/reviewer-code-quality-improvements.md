# Reviewer Code Quality Improvements

**Source:** Reviewer (Role 06) — Auto-mode review, 2026-07-21
**Severity:** Warning (not blocking)

## Issues

### 1. Unused variable `promptAccepted` (lines 186, 204 of pipeline-auto.ts)
Set when RPC prompt response arrives but never read afterward. Dead code — no runtime impact but indicates incomplete logic or leftover from development. **Fix:** Remove the variable and its assignments.

### 2. Function redefinition inside `processLine()` (lines ~195-217 of pipeline-auto.ts)
`flushBufferedLines()` and `flushAllBufferedText()` are defined as inner functions inside `processLine()`, meaning they get recreated on every JSONL line processed. **Fix:** Hoist both functions to the outer scope of `runSubAgent()` where they can capture `textBuffer` and `pendingTools` via closure without redefinition overhead.

### 3. Empty stderr handler (line ~260 of pipeline-auto.ts)
`child.stderr?.on("data", ...)` has an empty callback body with a comment saying "stderr is inherited but also captured for errors" — nothing is actually captured. **Fix:** Either remove the handler entirely or implement actual error logging.

## Suggestion (Nice-to-have)
- Hardcoded kickoff message on line ~265 could be extracted to a named constant (`KICKOFF_MESSAGE`) for consistency with `AUTO_ACCEPT_INSTRUCTIONS`.
