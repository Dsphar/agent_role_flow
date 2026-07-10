# 02 — Planner Complete

## Goal Summary
Improve Finalizer reset flow with explicit custom handoff instructions (Option A: Minimal Clarification)

## Architecture Overview
No architectural changes. This is a documentation/process improvement targeting two operational files in `ai_workspace/roles/`. The goal is to make the Finalizer's reset behavior self-contained and improve the user-facing message after a pipeline loop completes.

## File/Module Map
- **Modify:** `ai_workspace/roles/07_finalizer.md` — rename section, add explicit instruction
- **Modify:** `ai_workspace/roles/transition_guide.md` — update handoff messaging, fix typo

## Ordered Implementation Steps

1. **Rename section in `07_finalizer.md`:** Change "Execute Single-Commit Reset Flow" to **"Loop Reset and Handoff"** (in the heading and any cross-references within the file).

2. **Add explicit reset instruction in `07_finalizer.md`:** In the "Proceed to Reset" section, replace the vague reference ("proceed directly to the single-commit reset flow described above") with a clear, self-contained instruction that tells the Finalizer to execute its own Loop Reset and Handoff steps after presenting the recap — no implicit cross-reference needed.

3. **Update user-facing message in `transition_guide.md`:** Replace the generic *"Inform user: handoff ready. Start new session and the next role wil load."* with a more informative message specific to post-Finalizer reset, e.g.:
   > "Pipeline loop complete. All `_complete.md` files have been cleared and project context updated. Start a new session — the Interviewer will load for your next request."

4. **Fix typo in `transition_guide.md`:** Change "wil" to "will".

5. **Remove completed TODO item from `ai_workspace/todo.md`:** Remove the "Improve Finalizer Transition — Explicit Custom Reset Flow" entry since it is being addressed in this loop.

## Risks and Open Questions
- **Low risk:** These are wording-only changes to operational files. No behavioral logic is altered.
- The updated handoff message in `transition_guide.md` applies to all roles, not just the Finalizer. This is acceptable — it's a general improvement that benefits every transition point.
