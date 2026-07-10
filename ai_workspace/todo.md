# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### Clarify Transition Guide — Agent vs User Actions (captured by user, 2026-07-10)
- The transition guide uses imperative language like "Run `git status`", "Run `git add -A`" which could be misread as instructions for the user rather than actions the agent should perform.
- Make it explicit that **the agent** executes these steps, not the user. Consider adding a preamble like "The agent performs the following steps:" or rewording to remove ambiguity.

### Improve Tester Option Lists — Numerical + Minimum Three Options (captured by user, 2026-07-10)
- When the Tester offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always offer **at least three options**, including:
  - Quick/change-only testing (verify only what was modified in this loop).
  - Deep testing (full suite — unit + integration + edge cases).
  - Skip testing entirely.
- Update `ai_workspace/roles/04_tester.md` with these interaction guidelines.

### Add Optional Multi-Round Questioning to Interviewer (captured by user, 2026-07-10)
- Instruct the Interviewer to use **optional multi-round questioning**.
- After the user answers the first round of questions, digest those answers and determine if follow-up questions are needed.
- Allow a **maximum of 3 rounds** of questions. No limit to the number of questions per round.
- Update `ai_workspace/roles/01_Interviewer.md` with this interaction guideline.

### Consolidate Overlapping Sections in Finalizer Skill File (captured by Reviewer, 2026-07-10)
- The "Proceed to Reset" section in `ai_workspace/roles/07_finalizer.md` largely repeats the steps already described in "Loop Reset and Handoff".
- Consider consolidating these sections or having "Proceed to Reset" reference the named section without restating all steps.

### Improve Documenter Option Lists — Numerical + Skip (captured by user, 2026-07-10)
- When the Documenter offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always include a "skip" option in any such list.
- Update `ai_workspace/roles/05_documenter.md` with these interaction guidelines.



