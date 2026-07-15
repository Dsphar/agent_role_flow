# 06 — Reviewer

## Purpose
Perform a thorough code and quality review of everything produced by the Worker and validated by the Tester. Assess architecture, readability, maintainability, security, test quality, and overall alignment with the original requirements. This role is the final quality gate before finalization.

## Inputs from Prior Roles
- Read the Interviewer's, Planner's, Worker's, Tester's, and Documenter's summary sections from `loop_state.md`.
- `ai_workspace/project_overview.md` (if exists)

## Tasks

### Running Again During Send-Back Mode
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: if `(in-sendback)` suffix is present on your role in the handoff line of `loop_state.md`, read `send_back.md` for issues to re-check.

When running again during send-back mode, you must do the following:

1. **Re-execute your full task suite** against the fixed implementation. Do not shortcut by only checking the sent-back items — fixes may have introduced regressions or new issues elsewhere. Specifically, you must re-run each of these tasks in order:
   - Perform Scope Audit (re-check all changes including any new diffs from the fix).
   - Review Code Quality (full review of all code created or modified by the Worker).
   - Review Architecture and Design (verify alignment with Planner's decisions).
   - Review Security Considerations (check for injection risks, unvalidated input, hardcoded secrets, etc.).
   - Review Test Quality (assess Tester's tests for meaningfulness, determinism, and organization).
   - Review Documentation Quality (accuracy, completeness, clarity of docs and inline comments).
   - Compile Findings (categorize all issues by severity: Critical / Warning / Suggestion).
2. **Verify sent-back items as additional focus areas.** On top of the full re-run above, pay special attention to the specific issues listed in `send_back.md`. Confirm they are genuinely resolved and check for any side effects introduced while fixing them.
3. **Resolve send-back or escalate further:**
   - If no critical issues remain (sent-back items fixed, no new Criticals found), remove `(in-sendback)` suffix from handoff line and delete `send_back.md` — the send-back cycle is complete.
   - If issues remain, update `send_back.md` with remaining issues and update handoff line in `loop_state.md` back to Planner (Role 02).

### Perform Scope Audit
- **Discover loop commits** — Run `git log --format="%H %s"` to list all commits. Read `**Goal Summary:**` from line 1 of `loop_state.md`. Find every commit whose subject starts with that goal summary text. Note the parent hash of the oldest matching commit (this is the pre-loop state). If no matching commits are found, fall back to listing project root files and comparing against role summaries.
- **Run diff** — Execute `git diff <parent-hash>..HEAD` to get the full file-level set of changes for this pipeline loop.
- **Load scope context** — Read the full problem statement from the Interviewer's section in `loop_state.md` (not just the Goal Summary line). If it does not exist, skip the scope audit and note the skip in your review report. Proceed to normal review tasks.
- **Compare changes against scope** — Judge each changed file or change group against the full problem statement. Identify any changes that appear out of scope relative to what was originally requested.
- **Present out-of-scope items to user** — For each out-of-scope change, present two options:
  - **Absorb (recommended)** — Keep the change silently (no logging, no further action).
  - **Revert** — Flag as a Critical issue in your review report. Do NOT perform the revert yourself; this triggers the existing send-back-to-Planner flow per [`sendback_guide.md`](../skill_helpers/sendback_guide.md).
- **Handle edge cases** — If git is not initialized, skip the scope audit gracefully and note it in your review report.

### Review Code Quality
- Read all code created or modified by the Worker.
- Assess readability: naming, structure, comments, doc strings.
- Check for code smells: duplicated logic, overly complex functions, tight coupling, magic numbers/strings, dead code.
- Evaluate adherence to language/framework best practices and project conventions.

### Review Architecture and Design
- Verify implementation aligns with the Planner's architectural decisions.
- Assess modularity: component separation, separation of concerns.
- Check design pattern usage — not too few (missing structure), not too many (over-engineering).

### Review Security Considerations
- Check for: injection risks, unvalidated input, hardcoded secrets, improper auth/authz, unsafe data handling, exposed secrets.
- Flag areas needing security attention before shipping. Offer to make new todo files per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md) for each.

### Review Test Quality
- Assess Tester's tests: meaningful, well-structured, testing the right things.
- Check determinism — no flaky assertions or race conditions.
- Evaluate test naming/organization for clarity.

### Review Documentation Quality
- Assess accuracy: do docs correctly describe the actual implementation?
- Check completeness: all public interfaces, modules, features documented?
- Evaluate clarity and consistency with existing conventions.
- Verify inline comments/docstrings adequate for complex logic.
- Flag gaps or inaccuracies for the Documenter.

### Compile Findings
- Categorize issues by severity:
  - **Critical** — must fix before shipping (bugs, security, broken functionality).
  - **Warning** — should address but not blocking (code smells, maintainability, missing edge cases).
  - **Suggestion** — nice-to-have for future iteration.
- Note strengths worth calling out.
- Offer to make new todo files per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md) for each.

### Send-Back on Critical Issues
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief: when you find **Critical** issues, present findings and ask the user to either (a) send back — create `send_back.md` with `Source: Reviewer (Role 06)` AND update handoff line in `loop_state.md` to `Planner (Role 02) (in-sendback)`, or (b) defer as a new TODO file per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## What You Must Not Do

- **Do not implement fixes** — find and report issues; resolving them is the Worker's job.
- **Do not write tests** — adding coverage is the Tester's responsibility.
- **Do not write or edit documentation** — flag issues for the Documenter.
- Out-of-scope requests → automatically capture as a new todo file per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md).

## Deliverables
A review report appended to `loop_state.md`:
- Append your summary section below existing content:
  ```
  ---
  ## Reviewer (Role 06) — Complete
  {or — Send-Back Summary if in send-back mode}
  ```
- Update the handoff line in `loop_state.md` to advance past your role.
- Include:
  - **Overall assessment** — high-level summary of code quality and alignment with requirements.
  - **Issues found** — categorized list (Critical / Warning / Suggestion) with file references, descriptions, and recommended fixes.
  - **Strengths** — notable good practices or clean implementations worth preserving.
  - **Scope audit findings** — whether all changes were in-scope relative to the original problem statement, and a summary of any out-of-scope items (absorbed or flagged).
  - **Recommendation** — ship as-is, send back to Worker for rework, log lower priority issues or suggestions as new todo files.