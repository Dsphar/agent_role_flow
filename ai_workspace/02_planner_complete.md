# 02 — Planner Complete

## Plan: Consolidate Send-Back Cleanup Logic

### Goal
Move send-back cleanup instructions out of AGENTS.md so they live in exactly one place: `03_worker.md`.

### Architecture Overview
Documentation-only change across two markdown files. No code, no new files. The Worker role is the natural single source of truth since it's the only role that performs the cleanup.

### File Map
| File | Action |
|------|--------|
| `AGENTS.md` | **Modify** — replace step 4 in "Send-Back Detection" with a pointer to Worker role |
| `ai_workspace/roles/03_worker.md` | **No change** — already contains complete cleanup logic |

### Ordered Implementation Steps

1. **Edit AGENTS.md — Send-Back Detection, step 4:** Replace the detailed cleanup bullet points (deleting `send_back_to_worker.md`, deleting `_complete.md` files for roles at/after sending role, not deleting earlier ones) with: *"Worker handles send-back cleanup per its role file (`03_worker.md`)."*

2. **Verify no behavioral change:** Confirm Worker role's existing instructions produce identical behavior — same files deleted, same conditions. (Already confirmed during planning.)

### Risks
- **Low risk:** An agent following only AGENTS.md without loading the Worker role might miss cleanup details. Mitigated by step 2 in Send-Back Detection already requiring "Load the Worker role (`03_worker.md`)."

### Success Criteria (from Interviewer)
- [ ] Cleanup logic exists in exactly one place: `03_worker.md`.
- [ ] AGENTS.md references the Worker role for cleanup details without duplicating them.
- [ ] No behavioral change — same files get deleted, same conditions apply.
