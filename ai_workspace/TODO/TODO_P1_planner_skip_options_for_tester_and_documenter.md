## Add Planner Questions for Skip Options and Test Level Selection

- **Captured by:** Finalizer (Role 07)
- **Date:** 2026-07-13
- **Context:** User wants the Planner to ask two additional questions during scoping, then have downstream roles automatically act on those decisions. This is out of scope for the Finalizer role.

## Description

Add two new question rounds to the Planner's interview flow:

### Question 1 — Skip Documenter?
- Give the user an option to skip the Documenter role entirely for this pipeline loop.
- If skipped, the Planner should record this decision so the Tester (or next role after testing) can transition directly past the Documenter without needing a separate skip-docs prompt later.

### Question 2 — Testing Level Selection
- Give the user an option to choose what level of testing the Tester will perform: **quick**, **deep**, or **skip**.
- If "quick" — the Tester runs a lightweight/smoke test pass (fewer tests, faster).
- If "deep" — the Tester performs thorough testing (current default behavior).
- If "skip" — the Tester role is bypassed entirely.

### Downstream Role Changes
- **Tester:** Ingest the chosen testing level from the Planner's output and automatically adjust its test plan scope accordingly (quick = minimal, deep = full, skip = don't run). No separate user prompt needed at Tester time.
- **Documenter:** Ingest the skip decision from the Planner's output. If marked as skipped, produce a minimal stub `_complete.md` and transition immediately (similar to current skip-docs flow but decided upfront by the Planner rather than mid-pipeline by the Tester).

## Notes

- This replaces/augments the existing mid-pipeline skip prompts (e.g., the Tester's current skip-docs prompt) with upfront decisions made during planning.
- The Planner should record these choices in its `_complete.md` summary so downstream roles can reference them.
- Consider how this interacts with `project_overview.md` — if these become standard pipeline options, they may warrant a note there once implemented.
