# 02 — Planner Summary

## Goal Summary
Shared commit message summary across all pipeline roles

## What Was Planned
Plan to implement shared goal summaries for consistent commit messages across all pipeline roles, addressing TODO #2.

## Architecture Overview
- A `## Goal Summary` heading in `01_interviewer_complete.md` holds a concise (<100 char) description of the loop's goal.
- AGENTS.md transition instructions are updated so every role reads this summary and uses it as the commit message body (after `[ai-{role-name}] -- `).
- If no summary exists, roles fall back to generating their own ad-hoc summary.

## File/Module Map
| File | Action |
|------|--------|
| `01_Interviewer.md` | Modify — add instruction to produce `## Goal Summary` in output |
| `AGENTS.md` | Modify — update transition commit instructions to read shared summary |
| `ai_workspace/todo.md` | Modify — remove completed TODO #2 |

## Ordered Implementation Steps
1. **Update `01_Interviewer.md`** — Add an instruction for the Interviewer to produce a concise (<100 char) goal summary under `## Goal Summary` in their complete file, so future loops always generate one.
2. **Update AGENTS.md transition block** — Replace ad-hoc commit summary generation with: read `## Goal Summary` from `01_interviewer_complete.md`; if it exists, use it as the body after `[ai-{role-name}] -- `. If not, fall back to generating an ad-hoc summary.
3. **Remove TODO #2 from `ai_workspace/todo.md`** — Remove the "Use Interviewer's Goal Summary for All Role Commit Messages" entry since this loop addresses it.

## Risks and Open Questions
- None identified. The change is localized to AGENTS.md, one role skill file, and the TODO list.
