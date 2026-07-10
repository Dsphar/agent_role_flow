# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### Improve Tester Option Lists — Numerical + Minimum Three Options (captured by user, 2026-07-10)
- When the Tester offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always offer **at least three options**, including:
  - Quick/change-only testing (verify only what was modified in this loop).
  - Deep testing (full suite — unit + integration + edge cases).
  - Skip testing entirely.
- Update `ai_workspace/roles/04_tester.md` with these interaction guidelines.

### Consolidate Overlapping Sections in Finalizer Skill File (captured by Reviewer, 2026-07-10)
- The "Proceed to Reset" section in `ai_workspace/roles/07_finalizer.md` largely repeats the steps already described in "Loop Reset and Handoff".
- Consider consolidating these sections or having "Proceed to Reset" reference the named section without restating all steps.

### Finalizer: Multi-Line Commit Message + Squash Loop Commits (captured by user, 2026-07-10)
- Change the Finalizer's commit process to use a **multi-line commit message**:
  - First line: short summary of what was built/changed in this loop.
  - Subsequent lines: full summary of work done across the entire pipeline loop (Interviewer through Reviewer outcomes).
- After writing the multi-line commit, **squash all per-role commits from the current loop** (Interviewer → Planner → Worker → Tester → Documenter → Reviewer) into this single Finalizer commit. The result is one clean commit per pipeline iteration instead of 6–7 incremental ones.
- Update `ai_workspace/roles/07_finalizer.md` with the new multi-line message format and squash steps.
- Update `ai_workspace/roles/transition_guide.md` if it references Finalizer commit expectations.

### Improve Documenter Option Lists — Numerical + Skip (captured by user, 2026-07-10)
- When the Documenter offers a list of options to the user, make them **numerically numbered** so users can select by entering just numbers.
- Always include a "skip" option in any such list.
- Update `ai_workspace/roles/05_documenter.md` with these interaction guidelines.

### Finalizer: Use Interviewer Summary for Commit Message (captured by user, 2026-07-10)
- The Finalizer's commit message should use the **Goal Summary** that the Interviewer defines at the start of the pipeline (from `## Goal Summary` in `01_interviewer_complete.md`).
- Ensure `ai_workspace/roles/07_finalizer.md` explicitly instructs the Finalizer to source the short summary line from the Interviewer's goal summary rather than composing its own.
- This keeps commit messages consistent with how the work was originally scoped.



