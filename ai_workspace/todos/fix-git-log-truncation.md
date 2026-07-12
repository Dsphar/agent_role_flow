# Fix git log --oneline truncation breaking Finalizer subject-line matching

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-10
- **Context:** `07_finalizer.md` steps 4 and "Determine What Changed" use `git log --oneline`, which truncates each line to ~52 characters. Out-of-scope for the Reviewer — deferred as a todo.

## Description

If a goal summary exceeds ~40 chars, prefix matching against the full summary from step 1 will fail because `git log --oneline` truncates subject lines. Fix by either:
- Using `git log --format="%H %s"` for full subject lines in the Finalizer role, or
- Adding guidance keeping summaries under 40 characters.

## Notes

Affects `ai_workspace/roles/07_finalizer.md`. Update the role's git log commands and/or add a constraint on summary length.
