Source: Reviewer (Role 06)

## Critical Issues Found During Review

### C1: Reviewer Send-Back Creates an Infinite Loop — Worker Never Runs

**Files:** `AGENTS.md` (Send-Back Detection), `ai_workspace/roles/06_reviewer.md`

When the Reviewer creates a send-back, it deletes only `06_reviewer_complete.md` and `07_finalizer_complete.md`. The Worker's `_complete.md` (`03_worker_complete.md`) remains intact. On next session start:
1. Send-Back Detection reads `send_back_to_worker.md`, notes "do NOT force-load Worker"
2. Role Detection scans for first missing `_complete.md` → finds `06_reviewer_complete.md` is gone
3. **Loads Reviewer again** — not the Worker

The Reviewer enters "Running Again During Send-Back Mode", re-runs its review, finds the same critical issues (Worker never fixed them), and sends back again. Infinite loop.

**Fix:** When Reviewer creates a send-back, also delete `03_worker_complete.md` so role detection lands on the Worker. Update `ai_workspace/roles/06_reviewer.md` "Send-Back on Critical Issues" section to include deleting `03_worker_complete.md`. Alternatively, add logic in AGENTS.md: if `send_back_to_worker.md` exists and Worker's `_complete.md` exists, delete it before role detection.

---

### C2: Worker Guardrail Directly Contradicts AGENTS.md Commit Requirement

**Files:** `ai_workspace/roles/03_worker.md` ("What You Must Not Do"), `AGENTS.md` (Transitioning)

The Worker's skill file states: *"Do not handle version control. Committing, tagging, and git management belong to the Finalizer (role 07)."* But AGENTS.md now requires every role — including the Worker — to run `git add -A && git commit` during transition. This is a direct contradiction.

**Fix:** Update the Worker's "What You Must Not Do" section to acknowledge that per-role transition commits are handled by AGENTS.md and are exempt from this guardrail. E.g., *"Do not handle version control beyond the mandatory per-role transition commit defined in AGENTS.md."* Check other role skill files for similar contradictions.
