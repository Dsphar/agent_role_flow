## Add Fallback Guardrail for Malformed Line 2 Content

- **Captured by:** Tester (Role 04)
- **Date:** 2026-07-14
- **Context:** During deep testing of the pipeline config feature, it was noted that all roles assume well-formed key-value pairs on line 2 of `loop_state.md`. If a malformed value like `skip_docs=maybe` or `test_level=full` appears, no role currently handles this gracefully.

## Description

Add a brief "if value is unrecognized, fall back to asking the user" guardrail across:
- `ai_workspace/roles/04_tester.md` (line 2 checks for test_level and skip_docs)
- `ai_workspace/roles/05_documenter.md` (line 2 check for skip_docs)

Each role should validate that line 2 values match expected options (`yes|no`, `quick|deep|skip`) before acting on them. If unrecognized, fall back to asking the user directly.

## Notes

- This is a defensive improvement — not critical since line 2 is only written by pipeline roles themselves.
- Could be addressed in a future loop when adding more robustness to the orchestration system.
