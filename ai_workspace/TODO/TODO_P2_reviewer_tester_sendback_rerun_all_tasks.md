## Reviewer and Tester Must Re-Run All Original Tasks in Send-Back Mode

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-14
- **Context:** During full review of the pipeline config feature, it was noted that neither the Reviewer nor Tester role skill files explicitly state that in send-back mode they must re-run their complete original task suites alongside verifying the sent-back fixes.

## Description

Both `ai_workspace/roles/04_tester.md` and `ai_workspace/roles/06_reviewer.md` have a "Running Again During Send-Back Mode" section, but neither explicitly requires re-running all original tasks:

**Current Tester send-back text (04_tester.md):**
> "...read `send_back.md` for issues to address. Update or add any beneficial tests for the problems addressed during the send-back, then run the complete test suite."

This says "run the complete test suite" but doesn't say "re-run all original testing tasks" (test planning, edge case identification, etc.). A Tester could interpret this as only updating tests for the specific bugs and running them.

**Current Reviewer send-back text (06_reviewer.md):**
> "...read `send_back.md` for issues to re-check. Re-run review against fixed implementation."

This says "re-run review" but doesn't specify whether that means all review tasks (scope audit, code quality, architecture, security, test quality, documentation) or just re-checking the specific sent-back items.

**Fix:** Add explicit language to both roles' send-back sections stating:
- In send-back mode, you must **re-run your complete original task suite** (all sections under ## Tasks), not just verify the sent-back fixes.
- Sent-back items are *additional* focus areas — they do not replace your normal responsibilities.

## Files to Modify
- `ai_workspace/roles/04_tester.md` — "Running Again During Send-Back Mode" section
- `ai_workspace/roles/06_reviewer.md` — "Running Again During Send-Back Mode" section

## Notes
This is a guardrail improvement. Without it, a Tester or Reviewer in send-back mode could shortcut their work by only checking the sent-back items and missing regressions or new issues introduced during the fix.
