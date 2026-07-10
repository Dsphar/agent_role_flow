## Goal Summary
Clarify agent vs user actions in imperative shell commands [ai-interviewer]

---

## What Is Being Changed
Imperative shell command instructions across pipeline files are ambiguous — they read like commands directed at the user rather than actions the agent should perform. Switching these to self-referential "I" voice (e.g., "Run `git status`" → "I run `git status`").

## Why It Matters
Agents following these guides could misinterpret imperative phrasing as user-facing instructions, leading to confusion about who performs which step during transitions and finalization.

## Scope
- **5 instances** of `Run git ...` across **2 files**:
  - `ai_workspace/roles/transition_guide.md` (3 instances: lines ~21, 23, 25)
  - `ai_workspace/roles/07_finalizer.md` (1 instance: line ~14)
- All other imperative language in role files is clearly agent-directed and not ambiguous — no changes needed there.

## Technical Constraints and Preferences
- Keep second-person ("you") for general instructions — only change shell command lines to first-person "I".
- Minimal diff — 5 targeted replacements, no surrounding prose rewrites.
- No behavioral or structural changes to the pipeline.

## Success Criteria
- Zero remaining ambiguous imperative shell commands across all role files and AGENTS.md.
- All other instructional language preserved as-is.

## Origin
Addressing TODO item "Clarify Transition Guide — Agent vs User Actions" from `ai_workspace/todo.md`. Planner should plan its removal upon completion.
