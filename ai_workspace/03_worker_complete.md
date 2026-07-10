## Goal Summary
Clarify agent vs user actions in imperative shell commands [ai-worker]

---

## What Was Accomplished
Rewrote 4 ambiguous imperative shell command phrases across 2 markdown files into first-person "I" voice. Removed completed TODO from todo.md. Verified zero remaining instances via grep.

## Files Modified
| File | Changes |
|------|---------|
| `ai_workspace/roles/transition_guide.md` | 3 edits: `Run git status/add/commit` → `I run git ...` |
| `ai_workspace/roles/07_finalizer.md` | 1 edit: `Run git diff` → `I run git diff` |
| `ai_workspace/todo.md` | Removed "Clarify Transition Guide" TODO entry |

## Verification
- Grep across all role files + AGENTS.md confirmed zero remaining ambiguous imperatives.
- All changes match the Planner's ordered steps exactly — no deviations.
