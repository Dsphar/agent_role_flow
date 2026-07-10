## Goal Summary
Clarify agent vs user actions in imperative shell commands [ai-planner]

---

## What Was Accomplished
Produced a concrete implementation plan to rewrite ambiguous imperative shell commands across pipeline files into first-person "I" voice.

## Architecture Overview
Simple find-and-replace prose change across 2 markdown files. No structural or behavioral changes — only rewording `Run git ...` → `I run git ...`. Second-person ("you") preserved for all general instructions per constraints.

## File/Module Map
| File | Action | Lines |
|------|--------|-------|
| `ai_workspace/roles/transition_guide.md` | Modify 3 imperative commands | ~21, 23, 25 |
| `ai_workspace/roles/07_finalizer.md` | Modify 1 imperative command | ~14 |

## Ordered Implementation Steps (for Worker)
1. **Rewrite transition_guide.md shell commands** — Change "Run \`git status\`" → "I run \`git status\`", "Run \`git add -A\`" → "I run \`git add -A\`", "Run \`git commit ...\`" → "I run \`git commit ...\`".
2. **Rewrite 07_finalizer.md shell command** — Change "Run \`git diff\`" → "I run \`git diff\`".
3. **Verify no remaining ambiguous imperatives** — Grep all role files for any other `Run git ...` patterns that were missed.
4. **Remove completed TODO item** — Remove "Clarify Transition Guide — Agent vs User Actions" from `ai_workspace/todo.md`.

## Risks and Open Questions
- None significant. Straightforward prose change with minimal diff impact.
