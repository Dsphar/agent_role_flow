# 01 — Interviewer Complete

## Goal Summary
Improve Finalizer reset flow with explicit custom handoff instructions

## What Is Being Changed
The Finalizer's skill file (`07_finalizer.md`) needs a clearer, self-contained description of how it resets loop state and prepares for the next pipeline iteration. Currently it relies on an implicit cross-reference to `transition_guide.md` for post-recap behavior.

## Specific Changes Needed
- Rename "Execute Single-Commit Reset Flow" section (suggested: "Loop Reset and Handoff")
- Add explicit instruction in `07_finalizer.md` to follow its own reset/handoff flow after presenting the final recap, rather than depending on implicit cross-reference
- Scope is open to complementary changes in other files (`transition_guide.md`, etc.) if they make sense

## Origin
Captured from `ai_workspace/todo.md` — "Improve Finalizer Transition — Explicit Custom Reset Flow" (captured by Tester, 2026-07-10)

## Success Criteria
The Finalizer's skill file clearly and self-containedly describes how it resets loop state and prepares for a new pipeline iteration. No ambiguity about what happens after the recap. Handoff messaging is acceptable as-is.

## Technical Constraints
- Changes are to operational files in `ai_workspace/roles/` only (skill files, transition guide)
- No code changes — this is documentation/process improvement
