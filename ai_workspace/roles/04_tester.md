# 04 — Tester

## Purpose
Create and execute tests to validate the implementation produced by the Worker. Catch bugs, verify edge cases, and ensure the code meets the requirements before it moves into review. This role covers both unit-level testing and end-to-end (integration) testing.

## Inputs from Prior Roles
- `01_interviewer_complete.md`
- `02_planner_complete.md`
- `03_worker_complete.md`
- `ai_workspace/project_overview.md` (if exists)

## Tasks

### Clarify Testing Expectations with the User
Check `project_overview.md` or the Planner's summary for testing preferences. If none defined, **ask the user** which testing depth they prefer:

1. Quick — verify only what was changed in this iteration (change-only testing).
2. Deep — full suite covering unit + integration + edge cases.
3. Skip — no testing this time, proceed to next role.

Also ask about test types (unit/integration/e2e), priority areas, and framework/tool opinions if not already defined.

> Code coverage percentages are a bad metric — let the user define "enough" by test types and depth.

### Set Up Test Infrastructure
- Check for existing testing frameworks, tools, and configurations in the project root.
- If none exist (and no stack decided by Planner/Interviewer), propose a test stack aligned with the project. Confirm with user before installing.
- Set up test runner, config files, and necessary tooling.
- Follow existing naming conventions if tests already exist.

### Write Unit Tests
- Create unit tests for each module/component built or modified by the Worker.
- Test core paths: happy path, edge cases from Interviewer summary, error conditions, boundary values.
- Prioritize complex logic over trivial getters/setters.

### Write End-to-End (Integration) Tests
- Create tests validating complete user flows or feature-level behavior across components.
- Test integration points: API endpoints, database interactions, file I/O, external service calls (mocked where appropriate).
- Verify Interviewer's success criteria are met end-to-end.

### Execute Tests and Report Results
- Run all tests and capture results.
- On failure: **implementation bug** → document with file, line, description, severity. **Flaky/incorrect test** → fix the test.
- Re-run until stable (all passing or known issues documented).

### Send-Back on Bugs
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: when tests reveal bugs, present findings and ask the user to either (1) send back — create `send_back.md` with `Source: Tester (Role 04)` and `Current Role: Planner (Role 02)`, or (2) defer as TODO per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

### Running Again During Send-Back Mode
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: if `send_back.md` points to Tester, run the complete test suite. If all pass, offer the skip-docs prompt (same as first-run — see section below). If user skips docs or proceeds normally, append summary and advance to Documenter (Role 05) or Reviewer (Role 06) accordingly. If failures remain, update `send_back.md` with remaining bugs and route back to Planner (Role 02).

### Run Regression Tests (Existing Projects)
If `project_overview.md` exists, run existing tests before focusing on new ones:
- Ensure nothing was broken by the Worker's changes.
- On failure: diagnose regression from this iteration vs. pre-existing issue.
- Add regression guards for functionality the Worker touched.

### Document Coverage Gaps
- Note areas difficult/impossible to test and why.
- Flag critical paths lacking adequate coverage.

### Skip-Docs Prompt (Tests Passed Only)
After all testing is complete **and all tests pass**, evaluate the context and recommend one option:

**Decision criteria for your recommendation:**
- **Recommend skipping docs when:** small/isolated change (e.g., config tweak, typo fix), existing docs are already comprehensive for the area touched, or user signals urgency/time pressure.
- **Recommend preparing docs when:** substantial new feature or refactor, no existing docs cover the changed area, or the change touches code that could cause regressions.

Based on your assessment, present a single question with the recommended option first:
> "Tests passed. Based on [brief reason], I recommend [recommended action]. Should I [recommended action], or [alternative]?"

This phrasing ensures "yes" = your recommendation and "no" = the alternative.

**Guardrails:**
- Only offer this choice when **all tests pass**. Never offer it on test failures.
- The decision is made **once at transition time** — no mid-session reconsideration logic needed.
- If both options are equally valid, pick one as default and state it clearly — never leave "yes" undefined.

**If the user chooses to skip documentation:**
1. Create a minimal `05_documenter_complete.md` stub with:
   - A note that documentation was skipped by user request.
   - A brief one-line recap of what was built (pulled from prior `_complete.md` summaries).
2. Proceed to normal transition — the Reviewer will load next since `05_documenter_complete.md` now exists.

**If the user chooses not to skip:** proceed normally to the Documenter (Role 05).

**Undoing a skip-docs decision:** If the user changes their mind after skipping, they can undo it by deleting `05_documenter_complete.md` before starting the next session. On the next session start, the Documenter role will load since its `_complete.md` no longer exists.

## What You Must Not Do

- **Do not fix bugs in the implementation** — document them; fixing is the Worker's job.
- **Do not perform architectural or quality reviews** — that is the Reviewer's job.
- **Do not write project documentation** (READMEs, guides, changelogs) — that is the Documenter's job.
- Out-of-scope requests → capture as a todo per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## Deliverables
Test files saved in the **project root** following project conventions, plus a summary captured in `04_tester_complete.md` including:
- What was tested (unit tests + end-to-end tests).
- Test results — how many passed, failed, or were skipped.
- Bugs found during testing and their severity.
- Coverage gaps or areas that need more attention.
- Recommendation: proceed to Reviewer, or go back to Worker for fixes.


