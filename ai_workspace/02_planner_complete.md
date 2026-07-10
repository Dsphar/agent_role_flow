# 02 — Planner Complete

## Summary

Produced an implementation plan to add `--` separator in git commit messages for readability.

## Architecture Overview

Purely textual/formatting change — no code or behavior modified. Adding ` -- ` (space-dash-dash-space) between the role prefix and message body:
- `[ai-{role-name}] summary text` → `[ai-{role-name}] -- summary text`
- `[ai-{role-name}-sendback] summary text` → `[ai-{role-name}-sendback] -- summary text`

## Files to Modify

| File | Edits | Reason |
|------|-------|--------|
| `AGENTS.md` | 2 edits (lines ~22, ~62) | Primary commit message format definitions |
| `ai_workspace/project_context.md` | 2 edits (~lines 22, 31) | Descriptive references to old format |

Role skill files (`03_worker.md`, `05_summarizer.md`, `07_finalizer.md`) do NOT need changes — they defer message formatting to AGENTS.md.

## Ordered Implementation Steps

1. Update AGENTS.md send-back mode commit prefix (line 22) — add ` -- ` separator
2. Update AGENTS.md transition git commit rules (line 62) — add ` -- ` separator in commit message format
3. Update project_context.md descriptive references to reflect new format
4. Remove completed "Add `--` Separator" TODO from `ai_workspace/todo.md`

## Risks and Open Questions

- No technical risks — text-only change to markdown files
- User did not request extending the separator to `[pi-summary]` / `[pi-reset]` Finalizer commits — left out of scope per Interviewer scoping
