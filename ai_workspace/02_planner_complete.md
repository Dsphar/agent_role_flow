# 02 — Planner Complete

## Implementation Plan: Include Planner in Send-Back Cycle (TODO #3)

**Originated from:** `ai_workspace/todo.md` — TODO item "Include Planner in Send-Back Cycle"

### Architecture Overview

**Current flow:** Tester/Reviewer → create `send_back_to_worker.md` with `Current Role: Worker (Role 03)` → Worker fixes → advances to next role.

**New flow:** Tester/Reviewer → create `send_back.md` with `Current Role: Planner (Role 02)` → Planner appends additional steps → advances to Worker → Worker implements appended steps on top of existing code → advances normally through pipeline until reaching original sending role again, which deletes `send_back.md`.

**Key design decisions:**
- **Rename `send_back_to_worker.md` → `send_back.md`** — the file no longer routes exclusively to the Worker.
- **Planner appends, doesn't re-plan** — additional steps are added for send-back issues only.
- **Worker's existing code stays in place** — Worker implements appended steps on top of it.

### Ordered Implementation Steps

1. **Update `AGENTS.md`** — Replace all references of `send_back_to_worker.md` with `send_back.md`. Update the role detection example from `Current Role: Worker (Role 03)` to a generic example like `Current Role: Planner (Role 02)`.

2. **Update `ai_workspace/roles/04_tester.md`** — Rename all `send_back_to_worker.md` → `send_back.md`. Change the send-back creation instruction from "Send back to Worker" with `Current Role: Worker (Role 03)` to "Send back to Planner" with `Current Role: Planner (Role 02)`. Update re-run advancement logic accordingly.

3. **Update `ai_workspace/roles/06_reviewer.md`** — Same changes as Tester: rename file references, change send-back target from Worker to Planner (`Current Role: Planner (Role 02)`). As the original sending role in many cases, update deletion reference from `send_back_to_worker.md` → `send_back.md`.

4. **Update `ai_workspace/roles/03_worker.md`** — Rename all `send_back_to_worker.md` → `send_back.md`. Update send-back handling: Worker now receives work from Planner in send-back mode, so advancement should set `Current Role: Tester (Role 04)` (next sequential role). Remove sender-aware logic since Planner is the only source of send-backs to Worker now.

5. **Update `ai_workspace/roles/02_planner.md`** — Add a new "Handle Send-Back Work" section after inputs, instructing the Planner to:
   - Detect `send_back.md` on startup when `Current Role:` points to Planner
   - Read the issues listed in the file
   - Append additional implementation steps (not re-plan from scratch)
   - Use `[ai-planner-sendback]` commit prefix during transition
   - Advance `Current Role:` to `Worker (Role 03)` after completion

6. **Remove TODO #3 and TODO #6 from `ai_workspace/todo.md`** — Remove "Include Planner in Send-Back Cycle" (now implemented) and "Simplify Send-Back Advancement" (now redundant — our changes already remove sender-aware logic across all roles).

### Risks and Open Questions
- **Planner send-back mode is new territory:** No role before the Planner has handled send-backs. Edge cases will be caught by Tester/Reviewer in subsequent pipeline loops.
