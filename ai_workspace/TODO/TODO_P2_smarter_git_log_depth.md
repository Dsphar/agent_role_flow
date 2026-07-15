## Smarter git log depth calculation for roles

- **Captured by:** Finalizer (Role 07)
- **Date:** 2026-07-15
- **Context:** Roles currently use `git log` with arbitrary `-N` limits or step back too many commits to ensure they capture everything. Since every role step makes exactly one commit, the number of roles in the `loop_state.md` history line is a reliable indicator of how many commits belong to the current loop.

## Description

Add instructions across all relevant roles (and helper guides) to calculate git log depth dynamically instead of using hardcoded limits:

1. **Parse the role history from `loop_state.md` line 2** — count the number of roles listed in the `History:` field (e.g., `Interviewer → Planner → Worker → Reviewer` = 4 roles).
2. **Add a buffer of ~5 commits** to account for send-back iterations and edge cases. So if history shows 6 roles, look back `6 + 5 = 11` commits max.
3. **Use this calculated depth** in any `git log`, `git diff`, or commit-searching commands instead of arbitrary `-20` or similar limits.

This should be added to:
- Each role skill file that uses `git log` (Worker, Tester, Reviewer, Finalizer at minimum)
- Any helper guide that references git log usage
- AGENTS.md if it contains general git instructions

## Notes

- The buffer of 5 accounts for send-back loops where the same role may commit multiple times.
- If no `loop_state.md` exists (fresh start), fall back to a reasonable default like `-10`.
- This is a documentation/orchestration change only — no runtime code affected.
