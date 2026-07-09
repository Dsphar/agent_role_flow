# 03 Worker — Complete (Send-Back Cycle)

## What Was Done
Restructured the send-back flow across `AGENTS.md` and role skill files so that:

1. **`send_back_to_worker.md` persists** through the entire re-run cycle instead of being deleted by the Worker immediately. Every role sees it and knows to use `-sendback` commit prefix.
2. **Sending role anchors state in git** — when Tester or Reviewer creates `send_back_to_worker.md`, they immediately commit with `[ai-{role}-sendback]` prefix so the send-back reason is preserved in history.
3. **Every role appends a log entry** to `send_back_to_worker.md` under a "## Send-Back Log" heading, building an audit trail of what each role did during the cycle.
4. **Only the original sending role deletes the file** — when it re-runs and passes (no more bugs/issues), it deletes `send_back_to_worker.md` and `_complete.md` for roles after itself.

## Files Modified
- `AGENTS.md` — Rewrote Send-Back Detection section; added send-back log step in Transitioning; fixed commit prefix logic to handle sending role deleting the file mid-transition.
- `ai_workspace/roles/03_worker.md` — Worker no longer deletes `send_back_to_worker.md`; deletes only its own `_complete.md`.
- `ai_workspace/roles/04_tester.md` — Added send-back creation commit step; added "Running Again During Send-Back Mode" section.
- `ai_workspace/roles/06_reviewer.md` — Same pattern as Tester for Reviewer-specific flow.

## Known Issues / TODOs
None at this time.
