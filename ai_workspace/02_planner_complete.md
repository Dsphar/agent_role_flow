# 02 — Planner Complete

## Goal Summary
Improve Tester option lists with numeric numbering and minimum three options [ai-planner]

---

## Architecture Overview
Single-file edit to `ai_workspace/roles/04_tester.md`. Two sections are modified:
1. **"Clarify Testing Expectations with the User"** — add a numbered testing-depth prompt (3+ options).
2. **"Send-back on Bugs"** — convert `(a)` / `(b)` labels to numeric `1.` / `2.` format.

No new files, no structural changes. Purely interaction-format improvements preserving all existing Tester behavior.

## File/Module Map
| Action | File | Section | Change |
|--------|------|---------|--------|
| Modify | `ai_workspace/roles/04_tester.md` | "Clarify Testing Expectations with the User" | Add numbered testing-depth prompt block (3 options) |
| Modify | `ai_workspace/roles/04_tester.md` | "Send-back on Bugs" | `(a)` → `1.`, `(b)` → `2.` |

## Ordered Implementation Steps

### Step 1 — Add Testing-Depth Prompt to "Clarify Testing Expectations with the User"
In the existing section, after the current prose ("ask the user: test types..."), add a numbered list block that presents at least three testing-depth options:
```
1. Quick — verify only what was changed in this iteration (change-only testing).
2. Deep — full suite covering unit + integration + edge cases.
3. Skip — no testing this time, proceed to next role.
```
Keep the existing prose about asking for test types and depth as context before or after the numbered list. The numbered options should be clearly user-facing (the agent presents them and asks the user to pick a number).

### Step 2 — Convert Send-Back Options to Numeric Format
In the "Send-back on Bugs" section, change:
- `(a) Send back` → `1. Send back`
- `(b) Defer as TODO` → `2. Defer as TODO`

Preserve all existing descriptions and instructions under each option — only the labels change.

### Step 3 — Remove Completed TODO from `ai_workspace/todo.md`
Remove the entry "Improve Tester Option Lists — Numerical + Minimum Three Options" from the Pending section of `ai_workspace/todo.md`. This item was addressed by this pipeline loop (per Interviewer notes).

## Risks and Open Questions
- **None identified.** The changes are cosmetic/formatting-only to a single skill file. No behavioral logic is altered.
