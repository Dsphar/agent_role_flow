# 01 — Interviewer Complete

## Goal Summary
Reorder commit message format: tag at end, remove -- separator

## What Is Being Changed
The commit message format used across all pipeline roles is being reordered. The `[ai-{role-name}]` tag moves from the beginning to the **end** of commit messages, and the double-dash `--` separator between tag and body is removed entirely.

- **Old:** `[ai-tester] -- Improve Finalizer reset flow`
- **New:** `Improve Finalizer reset flow [ai-tester]`

This applies to:
- Normal per-role transition commits (`[ai-{role-name}]`)
- Send-back commits (`[ai-{role-name}-sendback]`)
- Finalizer reset commits (`[ai-finalizer]`)

## Files Requiring Updates
1. **`AGENTS.md`** (line 18) — send-back commit prefix/separator description
2. **`ai_workspace/roles/transition_guide.md`** (lines 22, 25) — commit message construction steps
3. **`ai_workspace/roles/01_Interviewer.md`** (line 45) — Goal Summary format reference
4. **`ai_workspace/project_context.md`** (lines 23, 40) — design decision and iteration history notes

## Why It Matters
Consistent commit message formatting with the tag at the end improves readability in git logs where the human-readable message appears first. This was captured as a TODO item from `ai_workspace/todo.md`.

## Technical Constraints
- All references to `[ai-{role-name}] -- {body}` must become `{body} [ai-{role-name}]`
- No double-dash separator anywhere
- Send-back suffix (`-sendback`) stays attached to the tag, also at end
- This is a documentation/formatting change only — no code or behavioral logic changes

## Origin
Item from `ai_workspace/todo.md`: "Reorder Commit Message Format — Tag at End, Remove Double Dash" (captured by user, 2026-07-10). Mark for removal upon completion.
