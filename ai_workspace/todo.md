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

### Reorder Commit Message Format — Tag at End, Remove Double Dash (captured by user, 2026-07-10)
- Move the `[ai-{role-name}]` tag from the **beginning** to the **end** of commit messages.
- Remove the double-dash separator `--` between the tag and the message body.
- New format: `{message body} [ai-{role-name}]` (e.g., `Improve Finalizer reset flow [ai-tester]`).
- Update all references in `AGENTS.md`, `transition_guide.md`, and any role skill files that mention commit message formatting.

### Improve Documenter Option Lists — Numerical + Skip (captured by user, 2026-07-10)
- When the Documenter offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always include a "skip" option in any such list.
- Update `ai_workspace/roles/05_documenter.md` with these interaction guidelines.



