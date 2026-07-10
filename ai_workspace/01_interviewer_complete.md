# 01 — Interviewer Complete

## Problem Statement (from `ai_workspace/todo.md`)

**Item:** Add `--` Separator in Git Commit Messages for Readability  
**Proposed by:** User (via Planner, 2026-07-09)

### What is being changed
Add a double-dash (`--`) separator between the role prefix and message body in all git commit messages produced by the pipeline.

### Format Changes
- **Normal commits:** `[ai-{role-name}] summary text` → `[ai-{role-name}] -- summary text`
- **Send-back commits:** `[ai-{role-name}-sendback] summary text` → `[ai-{role-name}-sendback] -- summary text`

### Scope
- `AGENTS.md` — the main transition/commit rules where commit message format is defined
- Any role skill files in `ai_workspace/roles/` that reference commit message formatting should be updated as well

### Goals / Success Criteria
All commit messages produced by the pipeline use the new format with `--` separator. No behavioral changes beyond visual formatting of commit messages.

### Constraints
- Keep existing prefix conventions (`[ai-{role-name}]`, `[ai-{role-name}-sendback]`) intact — only add the separator
- Apply consistently across all roles and both normal/send-back modes
