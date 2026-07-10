## Goal Summary
Update Tester send-back re-run to require full test suite

# Interviewer Summary — Role 01 Complete

## What is being changed
The **"Running Again During Send-Back Mode"** section in `ai_workspace/roles/04_tester.md` needs to be updated. Currently it says "Re-run your tests against the fixed implementation" which is vague and does not explicitly mandate running **all** tests. The requirement is that when re-running after send-back fixes, the Tester must run a **complete test suite** covering:
- Original tests from the first pass (to catch regressions)
- Any new or modified tests related to the send-back fixes

## Why it matters
Without this mandate, the Tester may only verify that specific reported bugs are resolved — potentially missing regressions introduced by the fix itself.

## Technical constraints and preferences
- Documentation-only change to `ai_workspace/roles/04_tester.md` (no code changes)
- The relevant section is "Running Again During Send-Back Mode"
- After this change, the corresponding TODO item in `ai_workspace/todo.md` should be removed as completed

## Origin
This item originated from `ai_workspace/todo.md` — "Tester in Send-Back Mode Must Run Full Test Suite". It should be noted for removal from the TODO list once implemented.
