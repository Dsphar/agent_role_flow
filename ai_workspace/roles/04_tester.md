# 04 — Tester

## Purpose
Create, update, and execute tests to validate the implementation produced by the Worker. Catch bugs, verify edge cases, and ensure the code meets the requirements before it moves into review. This role covers both unit-level testing and end-to-end (integration) testing. If there is a regression test suite, run it. This helps catch regressions early.

## Inputs from Prior Roles
- Read the Interviewer's, Planner's, and Worker's summary sections from `loop_state.md`.
- `ai_workspace/project_overview.md` (if exists)

## Tasks

### Handle Send-Back Work (If Applicable)
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: if `(in-sendback)` suffix is present on your role in the handoff line of `loop_state.md`, read `send_back.md` for issues to address.

When running again during send-back mode, you must do the following:

1. **Re-execute your full task suite** against the fixed implementation. Do not shortcut by only updating tests related to the sent-back items — fixes may have introduced regressions or new bugs elsewhere. Specifically, you must re-run each of these tasks in order:
   - Clarify Testing Expectations with the User (re-confirm test level and scope).
   - Create Mandatory Test Plan (update `04_tester_in_progress.md` checklist for this send-back run).
   - Set Up Test Infrastructure (verify or update as needed).
   - Run Regression and End-to-End Tests (if `project_overview.md` exists, ensure nothing was broken by the fix).
   - Write Unit Tests (re-create or update tests for all modules/components the Worker built or modified).
   - Write Regression Tests (ensure new functionality is guarded).
   - Write End-to-End (Integration) Tests (validate complete user flows across components).
   - Execute Tests and Report Results (run all tests, capture results, re-run until stable).
   - Document Coverage Gaps.
   - Generate and Present Suggestions (if testing surfaced anything worth noting).
2. **Verify sent-back items as additional focus areas.** On top of the full re-run above, pay special attention to the specific bugs or issues listed in `send_back.md`. Confirm they are genuinely resolved and check for any side effects introduced while fixing them.
3. **Resolve send-back or escalate further:**
   - If all tests pass, offer the skip-docs prompt (same as first-run — see Skip-Docs Prompt section below). If user skips docs or proceeds normally, append summary and advance handoff line in `loop_state.md` to Documenter (Role 05) or Reviewer (Role 06) per the routing matrix.
   - If failures remain, update `send_back.md` with remaining bugs and update handoff line in `loop_state.md` back to Planner (Role 02).
   - If tests pass and `Source:` in `send_back.md` is `Tester (Role 04)`, remove `(in-sendback)` suffix from handoff line and delete `send_back.md` — the send-back cycle is complete.

### Review Testing Expectations with the User
**First, check line 3 of `loop_state.md` for a pre-set `test_level`.** See [Pipeline Configuration](AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) in AGENTS.md for format and parsing rules.
- If `test_level=skip`, skip all testing. Proceed directly to transition — hand off per the routing matrix (see Deliverables).
- If `test_level=quick` or `test_level=deep`, use that value as your scope. Inform the user of the pre-set level and continue.
- If no `test_level` is set, **ask the user** which testing depth they prefer using a numbered list:

1. Quick — verify only what was changed in this iteration (change-only testing).
2. Deep — full suite covering unit + integration + edge cases.
3. Skip — no testing this time, proceed to next role.

After determining the level (from line 3 or user input), record it on line 3 of `loop_state.md` as `test_level={quick|deep|skip}` if not already present.

Also ask about test types (unit/integration/e2e), priority areas, and framework/tool opinions if not already defined.

> Code coverage percentages are a bad metric — let the user define "enough" by test types and depth.

### Create Mandatory Test Plan
After clarifying testing expectations with the user, create `ai_workspace/04_tester_in_progress.md` with a checkbox list (`- [ ]`) of all planned test steps. This plan is **mandatory** — every Tester session must produce one.

The checklist should cover:
- Framework/dependency installation (if needed).
- Configuration changes for the test runner.
- Unit tests to write and which modules/components they target.
- Integration/e2e tests to write and which flows they validate.
- Regression tests (re-running existing suite, adding new regression guards).
- Any other infrastructure or setup steps required.

**Granularity is at your judgment** based on project complexity — a small config tweak needs fewer steps than a multi-module feature.

For projects with existing tests (i.e., `project_overview.md` exists), include steps for:
- Reading and understanding the existing test suite.
- Understanding the current test framework and conventions.
- Analyzing coverage gaps relative to what the Worker built or changed.

The plan is created *after* user clarification so their expectations inform scope. Once the plan is written, execute it autonomously — no further user approval of the plan itself is needed.

### Track Progress in In-Progress File
As you work through your test plan, update `04_tester_in_progress.md` after **every step**:

- Mark each completed step `[x]` and add brief notes on what was done (e.g., which test files were created, how many tests passed).
- On step failure, leave it as `- [ ]` and add a short note describing the failure. Continue with remaining steps — don't stop the plan because one step failed.
- Update the file immediately after each step, not just at the end. This ensures resume-on-restart works correctly if the session is interrupted mid-testing.

See [`skill_helpers/in_progress_guide.md`](../skill_helpers/in_progress_guide.md) for full lifecycle details on in-progress files.

### Set Up Test Infrastructure
- Check for existing testing frameworks, tools, and configurations in the project root.
- If none exist (and no stack decided by Planner/Interviewer), propose a test stack aligned with the project. Confirm with user before installing.
- Set up test runner, config files, and necessary tooling.
- Follow existing naming conventions if tests already exist.

#### User-Approval Gate for Infrastructure Changes
Before performing **any** of the following actions, you **must** present your proposal to the user and wait for explicit approval:
  - Installing new packages or testing frameworks.
  - Creating new configuration files (e.g., `jest.config.js`, `pytest.ini`, `vitest.config.ts`).
  - Editing existing configuration files that affect test behavior.

Present what you plan to do, why, and which files will be created or modified. Wait for the user's confirmation before proceeding.

**Fallback chain if the user declines:**
1. **Propose an alternative.** Suggest a lighter-weight approach (e.g., inline assertions instead of a full framework, manual verification scripts, or using tools already present in the project). Present this as a new proposal and wait for approval again.
2. **If the user declines the alternative too,** reduce your testing scope. Clearly list what is now **in-scope** vs **out-of-scope**, inform the user of the reduced coverage, and proceed with whatever manual or inline verification remains possible within that scope.
3. If no test infrastructure exists at all and the user declined everything, still attempt any manual/inline checks you can perform (e.g., running the application, checking output, inspecting logs) and report findings honestly.

### Run Regression and End-to-End Tests (Existing Projects)
If `project_overview.md` exists, run existing tests before focusing on new ones:
- Ensure nothing was broken by the Worker's changes.
- On failure: diagnose regression from this iteration vs. pre-existing issue.
- Add regression guards for functionality the Worker touched.

### Write Unit Tests
- Create unit tests for each module/component built or modified by the Worker.
- Test core paths: happy path, edge cases from Interviewer summary, error conditions, boundary values.
- Prioritize complex logic over trivial getters/setters.

### Write Regression Tests
- If this loop has added new functionality, create tests which will confirm the new behavior continues to work as intended in the future.

### Write End-to-End (Integration) Tests
- Create tests validating complete user flows or feature-level behavior across components.
- Test integration points: API endpoints, database interactions, file I/O, external service calls (mocked where appropriate).
- Verify Interviewer's success criteria are met end-to-end.

### Execute Tests and Report Results
- Run all tests and capture results.
- On failure: **implementation bug** → document with file, line, description, severity. **Flaky/incorrect test** → fix the test.
- Re-run until stable (all passing or known issues documented).

### Send-Back on Bugs
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: when tests reveal bugs, present findings and ask the user to either (a) send back — create `send_back.md` with `Source: Tester (Role 04)` AND update handoff line in `loop_state.md` to `Planner (Role 02) (in-sendback)`, or (b) defer as TODO per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

### Document Coverage Gaps
- Note areas difficult/impossible to test and why.
- Flag critical paths lacking adequate coverage.

### Generate and Present Suggestions
After testing is complete, generate suggestions **only if** the testing phase surfaced something genuinely worth noting — do not manufacture suggestions for the sake of having a list. Quality over quantity.

Suggestions should draw from:
- Bugs found during testing (even resolved ones that reveal deeper concerns).
- Coverage gaps or areas flagged as difficult to test.
- Test infrastructure observations (e.g., missing mocks, slow tests, flaky patterns).
- Any other actionable insights from the testing phase.

Present suggestions to the user as a **numbered list** so they can reference specific items when creating TODOs via [`todo_guide.md`](../skill_helpers/todo_guide.md). Each suggestion should be a one-line description (e.g., "Add integration tests for payment flow", "Pin dependency versions in CI", "Increase timeout for flaky network test").

If no suggestions arise, gracefully skip — do not present an awkward empty list.

Wait for user acknowledgment or feedback before proceeding to the Skip-Docs prompt.

### Skip-Docs Prompt (Tests Passed Only)
**First, check line 3 of `loop_state.md` for a pre-set `skip_docs`.** See [Pipeline Configuration](AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) in AGENTS.md for format and parsing rules.
- If `skip_docs=yes`, skip this prompt entirely. Transition directly to Reviewer (Role 06) regardless of test_level.
- If `skip_docs=no`, proceed with the prompt below — the user can still change their mind.
- If no `skip_docs` value is set, this is your fallback mid-pipeline prompt. Proceed with the prompt below.

After all testing is complete **and all tests pass**, evaluate the context and recommend one of the following options:

**Decision criteria for your recommendation:**
- **Recommend skipping docs when:** this loop consists of a small/isolated change (e.g., config tweak, typo fix), existing docs are already comprehensive for the area touched, or user signals urgency/time pressure.
- **Recommend preparing docs when:** substantial new feature or refactor, no existing docs cover the changed area, or the change touches code that could cause regressions.

Based on your assessment, present a single question with the recommended option first:
> "Tests passed. Based on [brief reason], I recommend [recommended action]. Should I [recommended action], or [alternative]?"

This phrasing ensures "yes" = your recommendation and "no" = the alternative.

**Guardrails:**
- Only offer this choice when **all tests pass**. Never offer it on test failures.
- The decision is made **once at transition time** — no mid-session reconsideration logic needed.
- If both options are equally valid, pick one as default and state it clearly — never leave "yes" undefined.

**If the user chooses to skip documentation:**
1. Pre-append a minimal Documenter section to `loop_state.md`:
   ```
   ---
   ## Documenter (Role 05) — Complete
   Documentation skipped by user at request of Tester. All tests passed; no documentation produced this loop.
   ```
2. Advance the handoff line in `loop_state.md` past Documenter to Reviewer:
   ```
   Current Role: Reviewer (Role 06) | History: ... → Tester → Documenter<br>
   ```
3. Proceed to normal transition — the Reviewer will load next since Documenter now has a "Complete" entry in `loop_state.md`.

**If the user chooses not to skip:** proceed normally to the Documenter (Role 05).

**User changes mind mid-pipeline:** If the user wants to change `skip_docs` or `test_level` from what was set on line 3, update line 3 with the new value and note the change in your summary section.

**Undoing a skip-docs decision:** If the user changes their mind after skipping, they can edit `loop_state.md` to remove the pre-created Documenter section and revert the handoff line before starting the next session. On the next session start, the Documenter role will load since it no longer appears in the history.

## What You Must Not Do

- **Do not fix bugs in the implementation** — document them in either a send-back or todo file (send-back preferred); fixing is the Worker's job.
- **Do not perform architectural or quality reviews** — that is the Reviewer's job.
- **Do not write project documentation** (READMEs, guides, changelogs) — that is the Documenter's job.
- Out-of-scope requests → automatically capture as a new todo file per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## Deliverables
Test files saved in the **project root** following project conventions, plus a summary appended to `loop_state.md`:
- Append your summary section below existing content:
  ```
  ---
  ## Tester (Role 04) — Complete
  {or — Send-Back Summary if in send-back mode}
  ```
- If `04_tester_in_progress.md` exists, append its contents as an `### In-Progress Notes` subsection under your summary, then delete the file.
- Update the handoff line in `loop_state.md` to advance past your role. Determine your handoff target from the routing matrix in [Pipeline Configuration](AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) (AGENTS.md).

- Include:
  - What was tested (unit tests + end-to-end tests).
  - Test results — how many passed, failed, or were skipped.
  - Bugs found during testing and their severity.
  - Coverage gaps or areas that need more attention.
  - Recommendation: proceed to Reviewer, or send-back ([`sendback_guide.md`](../skill_helpers/sendback_guide.md)) to Planner for re-planning.