# 02 — Planner Complete

## Goal Summary
Move transition_guide.md into roles folder

## Architecture Overview
Pure file move + path update. No behavioral changes, no new files created. The `transition_guide.md` moves from `ai_workspace/` to `ai_workspace/roles/` so all operational skill/guide files live in one directory.

## File/Module Map

### Moved
- `ai_workspace/transition_guide.md` → `ai_workspace/roles/transition_guide.md` (via `git mv`)

### Modified (path references updated)
1. **`AGENTS.md`** — line 45: transition instruction path
2. **`ai_workspace/project_context.md`** — file structure map entry + history notes referencing the old path
3. **`ai_workspace/roles/02_planner.md`** — send-back mode reference
4. **`ai_workspace/roles/03_worker.md`** — send-back mode reference
5. **`ai_workspace/roles/05_documenter.md`** — send-back mode reference

### Modified (cleanup)
6. **`ai_workspace/todo.md`** — remove TODO #1 ("Move transition_guide.md into the roles folder")

## Ordered Implementation Steps

1. **Run `git mv ai_workspace/transition_guide.md ai_workspace/roles/transition_guide.md`** to move the file while preserving history.

2. **Update `AGENTS.md`:** change `ai_workspace/transition_guide.md` to `ai_workspace/roles/transition_guide.md` on line 45 (the "Transitioning Between Roles" instruction).

3. **Update `ai_workspace/project_context.md`:**
   - In the file structure map: change `transition_guide.md` entry path from `ai_workspace/transition_guide.md` to `ai_workspace/roles/transition_guide.md`.
   - In history notes (lines ~29-32): update any explicit path references that include `transition_guide.md` with a directory prefix. Notes that just mention the filename without a path can stay as-is since they're descriptive, not referential.

4. **Update role skill files** — change `ai_workspace/transition_guide.md` to `ai_workspace/roles/transition_guide.md` in:
   - `ai_workspace/roles/02_planner.md` (send-back mode section)
   - `ai_workspace/roles/03_worker.md` (send-back mode section)
   - `ai_workspace/roles/05_documenter.md` (send-back mode section)

5. **Remove TODO #1 from `ai_workspace/todo.md`:** delete the "Move transition_guide.md into the roles folder" entry and its description lines. Keep all other TODO items intact.

6. **Verify:** grep for any remaining references to `ai_workspace/transition_guide.md` (without `/roles/`) to catch missed paths. References in `01_interviewer_complete.md` are historical records and can stay as-is.

7. **Commit** with prefix `[ai-planner] -- Move transition_guide.md into roles folder`.

## Risks and Open Questions
- **None identified.** This is a low-risk, well-scoped change. All references have been audited. The only judgment call is whether descriptive history notes in `project_context.md` need path updates — the Worker should update explicit paths but leave bare filename mentions alone.
