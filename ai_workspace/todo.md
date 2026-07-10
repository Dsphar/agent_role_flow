# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### Clarify Transition Guide — Agent vs User Actions (captured by user, 2026-07-10)
- The transition guide uses imperative language like "Run `git status`", "Run `git add -A`" which could be misread as instructions for the user rather than actions the agent should perform.
- Make it explicit that **the agent** executes these steps, not the user. Consider adding a preamble like "The agent performs the following steps:" or rewording to remove ambiguity.

### Move transition_guide.md into the roles folder (captured by user, 2026-07-10)
- The `transition_guide.md` file currently lives at `ai_workspace/transition_guide.md` alongside role summaries and other workspace files.
- Move it into `ai_workspace/roles/` to keep all operational skill/guide files together in one directory.

### Improve Finalizer Transition — Explicit Custom Reset Flow (captured by Tester, 2026-07-10)
- The Finalizer's skill file does not explicitly reference `transition_guide.md` for its post-commit handoff messaging. It relies on AGENTS.md's general instruction to reach the hard-stop message.
- Since the Finalizer is the last role and resets `_complete.md` files, it needs a **custom transition flow** that clearly describes clearing loop state and preparing the workspace for a new pipeline iteration.
- Rename "Execute Single-Commit Reset Flow" to something more aligned with this purpose (e.g., "Loop Reset and Handoff" or similar).
- Add explicit instruction in `07_finalizer.md` to follow its own reset/handoff flow after presenting the final recap, rather than depending on an implicit cross-reference.

### Improve Tester Option Lists — Numerical + Minimum Three Options (captured by user, 2026-07-10)
- When the Tester offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always offer **at least three options**, including:
  - Quick/change-only testing (verify only what was modified in this loop).
  - Deep testing (full suite — unit + integration + edge cases).
  - Skip testing entirely.
- Update `ai_workspace/roles/04_tester.md` with these interaction guidelines.

### Improve Documenter Option Lists — Numerical + Skip (captured by user, 2026-07-10)
- When the Documenter offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always include a "skip" option in any such list.
- Update `ai_workspace/roles/05_documenter.md` with these interaction guidelines.



