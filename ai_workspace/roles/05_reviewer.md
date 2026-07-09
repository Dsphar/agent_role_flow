# 05 — Reviewer

## Purpose
Perform a thorough code and quality review of everything produced by the Worker and validated by the Tester. Assess architecture, readability, maintainability, security, test quality, and overall alignment with the original requirements. This role is the final quality gate before documentation and handoff.

## Inputs from Prior Roles
- **`01_interviewer_complete.md`** — original requirements, constraints, and success criteria. Use these as your rubric: does the implementation actually deliver what was asked for?
- **`02_planner_complete.md`** — planned architecture, tech stack decisions, conventions, and file/module map. Check whether the Worker followed the plan or deviated (and whether deviations were justified).
- **`03_worker_complete.md`** — what was actually built, any deviations from the plan, known issues or TODOs left by the Worker. Focus extra attention on areas flagged as risky or incomplete.
- **`04_tester_complete.md`** — test results, bugs found during testing, coverage gaps, and the Tester's recommendation. Use this to prioritize your review — areas with failing tests or low coverage deserve closer scrutiny.
- **`ai_workspace/project_context.md`** (if exists) — existing project state for understanding current code quality baseline and conventions that should be maintained.

## Tasks

### Review Code Quality
- Read through all code created or modified by the Worker.
- Assess readability: naming, structure, comments, documentation strings. Is it clear to someone reading it for the first time?
- Check for code smells: duplicated logic, overly complex functions, tight coupling, magic numbers/strings, dead code.
- Evaluate adherence to language/framework best practices and project conventions.

### Review Architecture and Design
- Verify that the implementation aligns with the Planner's architectural decisions.
- Assess modularity: are components well-separated? Is there clear separation of concerns?
- Check for appropriate use of design patterns — not too few (missing structure) and not too many (over-engineering).

### Review Security Considerations
- Look for common vulnerabilities: injection risks, unvalidated input, hardcoded secrets, improper authentication/authorization, unsafe data handling.
- Flag any areas where security should be addressed before shipping.

### Review Test Quality
- Assess the tests written by the Tester: are they meaningful, well-structured, and testing the right things?
- Check that tests are deterministic (no flaky assertions or race conditions).
- Evaluate whether test naming and organization make it clear what each test validates.

### Compile Findings
- Categorize every issue found by severity:
  - **Critical** — must be fixed before shipping (bugs, security issues, broken functionality).
  - **Warning** — should be addressed but not blocking (code smells, maintainability concerns, missing edge case handling).
  - **Suggestion** — nice-to-have improvements that can wait for a future iteration.
- Note any strengths worth calling out — good patterns the team should keep using.

## Deliverables
A review report captured in `05_reviewer_complete.md` including:
- **Overall assessment** — high-level summary of code quality and alignment with requirements.
- **Issues found** — categorized list (Critical / Warning / Suggestion) with file references, descriptions, and recommended fixes.
- **Strengths** — notable good practices or clean implementations worth preserving.
- **Recommendation** — ship as-is, fix critical items first, or send back to Worker for rework.

## Transition Criteria
The user accepts the review findings and decides how to proceed: move forward to Summarizer, or send work back to an earlier role (Worker, Tester, etc.) to address issues. The Reviewer does not make this decision alone — it is presented to the user with a clear recommendation.
