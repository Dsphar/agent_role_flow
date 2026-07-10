# 01 — Interviewer Complete

## Problem Statement: Include Planner in Send-Back Cycle (TODO #3)

**Originated from:** `ai_workspace/todo.md` — TODO item "Include Planner in Send-Back Cycle"

### What is being changed
Change the send-back flow so that all roles capable of sending back (Tester, Reviewer) route directly to the **Planner** instead of the Worker. The Planner appends additional steps to address the issues, then advances normally to the Worker who implements on top of existing code.

### Why it matters
Architectural and design-level problems found by later roles should be addressed at the planning stage before re-implementation, rather than forcing the Worker to fix structural issues without updated guidance.

### Technical constraints and preferences
- **Rename `send_back_to_worker.md` → generic name** (e.g., `send_back.md`) throughout the pipeline since it no longer routes exclusively to the Worker.
- **All sending roles route to Planner** — no decision logic needed; it always goes to Role 02.
- **Planner appends, doesn't re-plan** — additional steps are added to the existing plan rather than starting from scratch.
- **Worker's previous implementation stays in place** — Worker implements appended steps on top of existing code.
- **Planner advances normally** after send-back completion (to Worker).

### Files expected to change
1. `AGENTS.md` — send-back transition rules, file references
2. `ai_workspace/roles/02_planner.md` — add send-back mode awareness (read send-back file, append plan steps, commit prefix)
3. `ai_workspace/roles/04_tester.md` — update to route to Planner and reference renamed file
4. `ai_workspace/roles/06_reviewer.md` — update to route to Planner and reference renamed file
5. Any other role files that reference `send_back_to_worker.md`

### Edge cases / special considerations
- The Planner skill file currently has no send-back mode guidance — it needs full instructions for detecting the send-back file, reading prior context, appending steps, and using `[ai-planner-sendback]` commit prefix.
- The rename of `send_back_to_worker.md` affects all roles that reference it (AGENTS.md + role skill files). Ensure consistency across all references.
