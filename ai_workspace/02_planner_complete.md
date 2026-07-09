# 02 — Planner Complete

## Architecture Overview

Three targeted edits to existing markdown files. No new files, no new directories. The core change is a **mandatory two-commit reset flow** in the Finalizer that preserves `_complete.md` summaries in git history before cleaning them from the working tree. `project_context.md` is simplified to track current state only — iteration history moves entirely to git via summary commits.

### Key Decisions
- **Two-commit flow is mandatory** — no single-commit alternative offered to the user. Cleaner, fewer edge cases.
- **Commit messages use description-based tags:** `[pi-summary] <short description>` and `[pi-reset] <short description>`. The Finalizer already synthesizes a full recap from `_complete.md` files and `git diff`, so it can distill a brief tag (e.g., "add send-back mechanism"). This makes `git log` self-documenting without needing loop counters or dates.
- **`project_context.md` tracks current state only** — no iteration/loop history section. Loop records live in git via the summary commits from the Finalizer's two-commit flow.

### File/Module Map
| File | Action | Changes |
|------|--------|---------|
| `AGENTS.md` | Modify | Add brief description of mandatory two-commit reset flow for pipeline consistency |
| `ai_workspace/roles/07_finalizer.md` | Modify | Rewrite Project Context task (current state only), replace Version Control task with mandatory two-commit flow, update commit message format |
| `ai_workspace/project_context.md` | Modify | Remove "Iteration History" section, add note that loop records live in git via Finalizer summary commits |

## Ordered Implementation Steps

1. **Update `AGENTS.md`** — In the reset/reset-related sections, describe the mandatory two-commit flow so pipeline instructions are self-consistent with what the Finalizer actually does. Keep it brief since the Finalizer skill file is authoritative.

2. **Rewrite `07_finalizer.md` tasks:**
   - **Project Context task:** Change from "preserve prior context / append" to "reflect current state only — no iteration history." Add explicit instruction that loop records belong in git via summary commits, not in this file.
   - **Version Control task:** Replace with mandatory two-commit flow:
     1. First commit: all `_complete.md` files (01–07) + updated `project_context.md`. Message: `[pi-summary] <short description>`.
     2. Delete all `_complete.md` from working tree.
     3. Second commit: deletions only, clean slate. Message: `[pi-reset] <short description>`.
   - **Offer Next Steps task:** Remove the option to do a single-commit reset — it's now always two commits.

3. **Clean up `ai_workspace/project_context.md`** — Remove the "Iteration History" section entirely. Add a brief note (under file structure or key decisions) that loop records are preserved in git via Finalizer summary commits with `[pi-summary]` / `[pi-reset]` tags.

## Risks and Open Questions
- **No technical risks** — purely markdown/prompt changes to role definitions.
- The description-based commit messages rely on the Finalizer synthesizing a short tag from its recap work, which it already does. No additional capability needed.
