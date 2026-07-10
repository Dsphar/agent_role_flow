# 02 — Planner Summary

## Objective
Simplify `07_finalizer.md` to eliminate redundancy now that every role already commits independently during transition. Remove send-back support entirely from the Finalizer. Replace two-commit flow with a single `[ai-finalizer]` commit. Stop creating `07_finalizer_complete.md`.

## Architecture Overview
Single-file edit to `07_finalizer.md` plus TODO cleanup in `todo.md`. No new files, no structural changes beyond what's scoped.

## Ordered Implementation Steps

1. **Update Purpose section** — Replace "two-commit reset flow" language with "single-commit reset flow." Clarify that per-role commits already preserve all artifacts.
2. **Remove send-back section entirely** — Delete the "Handle Send-Back Work (If Applicable)" task block. The Finalizer will never receive or handle send-backs.
3. **Replace two-commit reset with single commit** — Remove `[pi-summary]` and `[pi-reset]` steps. Replace with: stage `project_context.md` + delete all `_complete.md`/`_in_progress.md` files, commit with `[ai-finalizer] -- <short summary>`.
4. **Remove `07_finalizer_complete.md` references** — From Deliverables and "What You Must Not Do" sections. The Finalizer no longer creates its own summary artifact.
5. **Update Deliverables section** — Reflect only: updated `project_context.md`, single git commit, and verbal recap to the user.
6. **Update "Proceed to Reset" section** — Reference single-commit flow instead of two-commit.
7. **Remove completed TODO from `todo.md`** — Delete the "Review Finalizer Flow After Per-Role Commits" entry.

## Risks / Notes
- AGENTS.md role detection should still work correctly since no `_complete.md` for role 07 is ever created (it's always the first missing after 01–06).
- Only `07_finalizer.md` and `todo.md` are modified — no other files touched.
