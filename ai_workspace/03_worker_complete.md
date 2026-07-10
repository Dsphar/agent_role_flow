## Goal Summary
Enforce return-to-role after capturing TODOs in AGENTS.md

# Worker Complete — Enforce Return-to-Role After Capturing TODOs

## What Was Done
Added two explicit behavioral rules under "During a Role Session" in `AGENTS.md`:
1. After capturing an out-of-scope request into `todo.md`, acknowledge briefly then immediately resume current role's work.
2. Capturing a TODO does not count as completing your role's tasks — do not transition early or stop working because you logged something.

Removed the completed TODO item from `ai_workspace/todo.md`.

## Plan Execution
- [x] Step 1: Read AGENTS.md, located "During a Role Session" section
- [x] Step 2: Added return-to-role rule as new bullets
- [x] Step 3: Verified no conflict with send-back flow
- [x] Step 4: Removed completed TODO from todo.md

## Deviations
None — followed the plan exactly.

## Known Issues / Partial Implementations
None.

## Files Modified
| File | Change |
|------|--------|
| `AGENTS.md` | Added 2 bullets under "During a Role Session" |
| `ai_workspace/todo.md` | Removed completed TODO item |
