# 01 — Interviewer Complete

## Goal Summary
Improve Tester option lists with numeric numbering and minimum three options [ai-interviewer]

---

## What Is Being Changed
Update `ai_workspace/roles/04_tester.md` to use numerically numbered user-facing option lists, ensuring at least three choices where applicable.

## Specific Changes Required
1. **Testing-depth prompt** — Add a numbered list (at minimum: quick/change-only testing, deep/full testing, skip entirely) in the "Clarify Testing Expectations with the User" section at the start of the Tester flow.
2. **Send-back options** — Change existing `(a)` / `(b)` labels to `1.` / `2.` numeric format for consistency.

## Why It Matters
- Numeric numbering lets users select by entering just a number — faster and less error-prone.
- Offering at least three testing-depth choices gives the user meaningful control over test scope without requiring verbose input.

## Technical Constraints
- Only modify `ai_workspace/roles/04_tester.md`.
- Preserve all existing Tester behavior — this is purely an interaction-format improvement.

## Origin
Addressed TODO item: "Improve Tester Option Lists — Numerical + Minimum Three Options" from `ai_workspace/todo.md` (captured by user, 2026-07-10). Planner should plan its removal upon completion.
