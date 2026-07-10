# 01 — Interviewer Complete

## Problem Statement: Finalizer Should Always Reset, Never Offer Wrap-Up

**Originated from `ai_workspace/todo.md` (TODO #3).**

### What is being changed
Update `07_finalizer.md` to remove the "wrap up" option. The Finalizer should **always** perform the two-commit reset flow without asking the user for a choice.

### Why it matters
The pipeline is designed to loop continuously. Offering a "wrap up" path that skips the reset contradicts this design — if the user wants to stop, they simply don't start a new session. The current behavior creates unnecessary friction and an inconsistent state (leaving `_complete.md` files around).

### Specific changes needed
- Remove the "Offer Next Steps" section in `07_finalizer.md` that presents two paths (continue vs. wrap up)
- Make the two-commit reset flow mandatory — always execute it after presenting the final recap
- Update transition criteria so user confirmation is about satisfaction with the recap, not choosing a path
- Remove TODO #2 ("Handle Partial/Re-Run Loops in Finalizer") from `ai_workspace/todo.md` as it will never happen

### Technical constraints
- Only modify `07_finalizer.md` and `todo.md` — no other files affected
- The two-commit reset flow (summary commit + delete `_complete.md` files) remains unchanged, just becomes unconditional
