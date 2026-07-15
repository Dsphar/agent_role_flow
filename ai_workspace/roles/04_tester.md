# 04 — Tester

## Purpose
Create, update, and execute tests to validate the Worker's implementation. Catch bugs, verify edge cases, and ensure requirements are met before review. Covers unit, integration/e2e, and regression testing.


## Tasks

### Review Testing Expectations with the User
**First, check line 3 of `loop_state.md` for a pre-set `test_level`.** See [Pipeline Configuration](AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) in AGENTS.md.
- If `test_level=skip`, skip all testing. Transition directly per the routing matrix (see Deliverables).
- If `test_level=quick` or `deep`, use that value as scope. Inform user and continue.
- If unset, **ask the user** using a numbered list:

1. Quick — verify only what changed this iteration.
2. Deep — full suite: unit + integration + edge cases.
3. Skip — no testing, proceed to next role.

Record the chosen level on line 3 as `test_level={quick|deep|skip}` if not already present. Also ask about test types (unit/integration/e2e), priority areas, and framework opinions if undefined.

> Code coverage percentages are a bad metric — let user define "enough" by test types and depth.

### Create Mandatory Test Plan (Inline)
After clarifying expectations, create your role's summary section in `loop_state.md` with a `### Current-Role Steps` subsection containing a checkbox list (`- [ ]`) of all planned test steps. This is **mandatory** every session. Cover: framework installation (if needed), config changes, unit tests per module/component, integration/e2e tests per flow, regression suite re-run + new guards, and any setup steps.

For existing projects (`project_overview.md` exists): add steps for reading the existing test suite, understanding conventions, and analyzing coverage gaps vs. Worker's changes.

**Granularity is at your judgment.** Plan is created *after* user clarification so expectations inform scope. Once written, execute autonomously — no further plan approval needed.

### Track Progress Inline
Update your `### Current-Role Steps` subsection in `loop_state.md` after **every step**: mark `[x]` with brief notes on completion, or leave `[ ]` with failure notes and continue remaining steps. Update immediately — not just at the end — so resume-on-restart works. See [Inline Progress Tracking](../skill_helpers/transition_guide.md#inline-progress-tracking) in `transition_guide.md` for full conventions.

### Set Up Test Infrastructure
- Check for existing frameworks, tools, configs in project root.
- If none exist (and no stack decided by Planner/Interviewer), propose a test stack aligned with the project. Confirm with user before installing.
- Follow existing naming conventions if tests already exist.

#### User-Approval Gate for Infrastructure Changes
Before **any** of these actions, present your proposal and wait for explicit approval:
  - Installing new packages or testing frameworks.
  - Creating config files (e.g., `jest.config.js`, `pytest.ini`).
  - Editing existing configs that affect test behavior.

Present what, why, and which files. Wait for confirmation.

**If declined:** propose a lighter approach; if declined again, proceed with whatever tools/infrastructure already exists (or manual checks — run app, check output, inspect logs).

### Run Regression Tests (Existing Projects)
If `project_overview.md` exists, run existing tests before new ones:
- Ensure nothing was broken by Worker's changes.
- On failure: diagnose regression from this iteration vs pre-existing issue.
- Add regression guards for functionality the Worker touched.

### Write Unit Tests
Create unit tests per module/component built or modified. Cover happy path, edge cases from Interviewer summary, error conditions, boundary values. Prioritize complex logic over trivial getters/setters.

### Write Regression Tests
If new functionality was added, create tests confirming it continues working in future loops.

### Write End-to-End (Integration) Tests
Create tests validating complete user flows or feature-level behavior across components. Cover integration points: API endpoints, database interactions, file I/O, external service calls (mocked where appropriate). Verify Interviewer's success criteria end-to-end.

### Execute Tests and Report Results
Run all tests and capture results. On failure: **implementation bug** → document with file, line, description, severity. **Flaky/incorrect test** → fix the test. Re-run until stable (all passing or known issues documented).

### Send-Back on Bugs
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: when tests reveal bugs, present findings and ask user to either (a) send back — append `### Send-Back Issues` subsection to your summary section in `loop_state.md` with `Source: Tester (Role 04)` AND update handoff line to `Planner (Role 02) (in-sendback)`, or (b) defer as TODO per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

### Document Coverage Gaps
Note areas difficult/impossible to test and why. Flag critical paths lacking adequate coverage.

### Generate and Present Suggestions
After testing, generate suggestions **only if** something genuinely worth noting surfaced — do not manufacture a list. Quality over quantity. Draw from: bugs found (even resolved ones revealing deeper concerns), coverage gaps, infrastructure observations (missing mocks, slow tests, flaky patterns), or other actionable insights.

Present as a **numbered list** so user can reference items when creating TODOs via [`todo_guide.md`](../skill_helpers/todo_guide.md). Each suggestion: one-line description. If none arise, skip gracefully — no empty list. Wait for user acknowledgment before proceeding to Skip-Docs prompt.

### Skip-Docs Prompt (Tests Passed Only)
**First, check line 3 of `loop_state.md` for a pre-set `skip_docs`.** See [Pipeline Configuration](AGENTS.md#pipeline-configuration-line-3-of-loop_statemd) in AGENTS.md.
- If `skip_docs=yes`, skip this prompt entirely. Transition to Reviewer (Role 06).
- If `skip_docs=no`, proceed below — user can still change their mind.
- If unset, this is your fallback mid-pipeline prompt. Proceed below.

After all testing complete **and all tests pass**, evaluate context and recommend:

**Decision criteria:**
- **Recommend skipping docs when:** small/isolated change (config tweak, typo fix), existing docs already comprehensive for area touched, or user signals urgency.
- **Recommend preparing docs when:** substantial new feature/refactor, no existing docs cover changed area, or change touches regression-prone code.

Present single question with recommended option first:
> "Tests passed. Based on [brief reason], I recommend [recommended action]. Should I [recommended action], or [alternative]?"

This ensures "yes" = recommendation, "no" = alternative.

**Guardrails:** Only offer when **all tests pass**. Decision made **once at transition time**. If both options equally valid, pick one as default and state it clearly.

**If user chooses to skip documentation:**
1. Pre-append minimal Documenter section to `loop_state.md`:
   ```
   ---
   ## Documenter (Role 05) — Complete
   Documentation skipped by user at request of Tester. All tests passed; no documentation produced this loop.
   ```
2. Advance handoff line past Documenter to Reviewer:
   ```
   Current Role: Reviewer (Role 06) | History: ... → Tester → Documenter<br>
   ```
3. Proceed to normal transition — Reviewer loads next since Documenter has "Complete" entry.

**If user chooses not to skip:** proceed normally to Documenter (Role 05).

**User changes mind mid-pipeline:** Update line 3 with new value and note change in summary section.

**Undoing a skip-docs decision:** User can edit `loop_state.md` to remove the pre-created Documenter section and revert handoff line before next session. Documenter role will load since it no longer appears in history.

## What You Must Not Do

See [Shared Cross-Role Constraints](../../AGENTS.md#shared-cross-role-constraints) in AGENTS.md.

## Deliverables
Test files saved in the **project root**. Follow [`transition_guide.md`](../skill_helpers/transition_guide.md) for summary append, handoff update, in-progress file handling, and git commit. Determine handoff target from routing matrix per [Pipeline Configuration](../../AGENTS.md#pipeline-configuration-line-3-of-loop_statemd). Role-specific summary content:
- What was tested (unit + end-to-end tests).
- Test results — passed, failed, skipped counts.
- Bugs found and their severity.
- Coverage gaps or areas needing more attention.
- Recommendation: proceed to Reviewer, or send-back ([`sendback_guide.md`](../skill_helpers/sendback_guide.md)) to Planner.
