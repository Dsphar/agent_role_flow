## Tester Must Create Step-by-Step Plan and Track Progress in In-Progress File

- **Captured by:** Tester (Role 04)
- **Date:** 2026-07-13
- **Context:** User wants the Tester to explicitly create a detailed step-by-step plan for itself before executing tests. This is out of scope for the current loop which already completed testing and transitioned.

## Description

Modify `ai_workspace/roles/04_tester.md` so that the Tester must:

1. **Create a mandatory step-by-step test plan** at the start of its session. The plan should cover:
   - Installing any needed testing frameworks or dependencies.
   - Configuration changes (test runner config, mock setups, etc.).
   - Running different kinds of tests (unit, integration, e2e, regression) in a defined order.
   - Any other test infrastructure setup steps.

2. **Save this plan into an in-progress file** (`04_tester_in_progress.md`) as part of its normal workflow — not optional.

3. **Update the in-progress file after every step is completed**, marking progress so that if the session is interrupted, the Tester can resume from exactly where it left off.

## Notes

- This leverages the existing in-progress file mechanism described in `ai_workspace/skill_helpers/in_progress_guide.md`.
- The plan should be detailed enough to serve as both a checklist and a resume point.
- Consider whether this planning step should come before or after "Clarify Testing Expectations with the User" — likely after, since user input may shape the plan.
