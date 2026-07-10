# 02 — Planner Complete

## Plan: Finalizer Should Always Reset, Never Offer Wrap-Up

### Problem Statement (from Interviewer)
Update `07_finalizer.md` to remove the "wrap up" option. The Finalizer should **always** perform the two-commit reset flow without asking the user for a choice.

### Architecture Overview
Documentation-only change targeting two files in `ai_workspace/`. No code, tests, or project files affected. The Finalizer's existing reset flow becomes unconditional.

### File/Module Map

| File | Action |
|------|--------|
| `ai_workspace/roles/07_finalizer.md` | Modify — remove "Offer Next Steps", update Purpose, Transition Criteria, Deliverables |
| `ai_workspace/todo.md` | Modify — remove completed TODO #2 and TODO #3 |

### Ordered Implementation Steps

1. **Update `07_finalizer.md` — Purpose section:** Replace "offer the user the option to reset for a new iteration or wrap up entirely" with language stating the Finalizer always performs the two-commit reset flow after presenting the final recap.

2. **Update `07_finalizer.md` — Remove "Offer Next Steps":** Delete the entire "### Offer Next Steps" section (presenting paths 1 and 2). Replace with a directive: after presenting the final recap, if the user is satisfied, proceed directly to the two-commit reset flow. No choice offered.

3. **Update `07_finalizer.md` — Transition Criteria:** Change from "user confirms ... and chooses either to reset or wrap up" to simply "user confirms they are satisfied with the final recap." The reset is automatic after satisfaction.

4. **Update `07_finalizer.md` — Deliverables:** Remove mention of "the user's chosen next step (reset or wrap up)" since there is no longer a choice.

5. **Update `todo.md` — Remove completed items:** Delete the entries for TODO #2 ("Handle Partial/Re-Run Loops in Finalizer") and TODO #3 ("Finalizer Should Always Reset, Never Offer Wrap-Up"). Keep remaining TODOs intact.

6. **Commit:** Standard `[ai-worker]` transition commit per AGENTS.md.

### Risks and Open Questions
None identified — straightforward text-edit task with clear before/after states.
