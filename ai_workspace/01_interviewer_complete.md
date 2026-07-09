# 01 — Interviewer Summary

## What We're Doing
Improving the agent role pipeline itself (meta-work). Two issues identified:

### Issue 1: AGENTS.md is too long / bloated context
- **Problem:** The file contains redundant sections and documentation that never gets used at runtime, wasting context window.
- **Status:** Already trimmed — removed "Role Skill File Template", "Key Rules" (pure duplication), and "Resetting the Pipeline" (lives in role 07's skill file). Tightened prose throughout. Reduced from ~130 to ~85 lines.

### Issue 2: Roles don't stay in their lane
- **Problem:** The Planner (and potentially other roles) jumps ahead and does work that belongs to future roles — e.g., writing code instead of just planning it.
- **Status:** Partial fix applied:
  - Added a general "Stay in your lane" guardrail in AGENTS.md under "During a Role Session".
  - Added a "What You Must Not Do" section to `02_planner.md`.

### Remaining Work
Add similar "What You Must Not Do" guardrails to the remaining role skill files:
- `03_worker.md` — should not do testing, reviewing, or summarizing work
- `04_tester.md` — should not fix bugs (that's Worker territory) or review/summarize
- `05_reviewer.md` — should not implement fixes or write tests
- `06_summarizer.md` — should not modify code or do version control tasks
- `07_version_controller.md` — should not go back and change code or summaries

Each guardrail section should clearly state what the role must NOT do, referencing which future (or past) roles own those responsibilities.

## Success Criteria
All 7 role skill files have explicit boundary guardrails that prevent role bleeding. The agent stays in its assigned lane throughout a session.
