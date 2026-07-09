# 01 — Interviewer Complete

## Problem Statement: Consolidate Send-Back Cleanup Logic

### What is being changed
Move the send-back cleanup logic out of AGENTS.md and into the Worker role (`03_worker.md`) as the single source of truth.

### Why it matters
The cleanup instructions (deleting `send_back_to_worker.md` and `_complete.md` files for roles at/after the sending role) are duplicated between:
- **AGENTS.md** — "Send-Back Detection" section, step 4
- **Worker role** — "Handle Send-Back Work" section, step 4

If one changes and the other doesn't, they drift apart. Consolidating eliminates that maintenance risk.

### Changes required
1. **AGENTS.md (Send-Back Detection):** Keep steps 1–3 (detect file exists, load Worker role, greet as Worker). Replace step 4's detailed cleanup instructions with a pointer: "Worker handles send-back cleanup per its role file."
2. **Worker role (`03_worker.md`):** Already contains the full cleanup logic — keep it as-is or polish if needed. This becomes the single source of truth.
3. **Tester and Reviewer roles:** No changes needed — they already know how to *create* `send_back_to_worker.md`. They don't need cleanup instructions.

### Constraints / Preferences
- AGENTS.md should stay minimal (per existing design philosophy).
- The Worker role is the natural home since it's the only role that actually performs the cleanup after resolving send-back items.
- Roles after Worker (Tester, Summarizer, Reviewer, Finalizer) need to know about the send-back *process* but not the *cleanup*.

### Success Criteria
- Cleanup logic exists in exactly one place: `03_worker.md`.
- AGENTS.md references the Worker role for cleanup details without duplicating them.
- No behavioral change — same files get deleted, same conditions apply.
