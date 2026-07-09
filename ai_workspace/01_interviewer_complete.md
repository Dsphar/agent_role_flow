# 01 — Interviewer Complete

## Problem Statement

The Finalizer's reset flow loses the working-tree record of a completed loop because summaries and deletions happen in a single commit. Additionally, `project_context.md` is cluttered with iteration history that belongs in git instead.

## Goals / Success Criteria

- After reset, all `_complete.md` files are preserved in git history via a dedicated summary commit before deletion.
- A second commit leaves the working tree completely clean for the next pipeline loop.
- `project_context.md` reflects only the current state of the project — no iteration/loop history section. Loop records live in git via summary commits instead.

## Changes Required

### Files to Modify
1. **`AGENTS.md`** — Update reset instructions to match new two-commit flow.
2. **`07_finalizer.md`** — Update role tasks: update `project_context.md` (current state only), create summary, then execute two-commit reset flow.
3. **`ai_workspace/project_context.md`** — Remove existing "Iteration History" section. Clarify in the file that it tracks current state only.

### New Reset Flow (Finalizer)
1. Update `project_context.md` to reflect current project state (no iteration history).
2. Create `07_finalizer_complete.md` with full recap.
3. **First commit:** All `_complete.md` files (01–07) + updated `project_context.md`. Message: `[pi-loop-N] Summaries`.
4. Delete all `_complete.md` files from working tree.
5. **Second commit:** Deletions only, clean slate. Message: `[pi-loop-N] Reset complete`.

## Constraints
- Git is expected — no fallback needed for non-git projects.
- Only the three files above are in scope.
