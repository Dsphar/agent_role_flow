# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope. Each entry notes which role should handle it.

---

## Pending

### Guardrail Enforcement Fix (from Reviewer, loop 1)
**Proposed by:** User + Reviewer  
**Should be handled by:** Planner → Worker  

The Reviewer broke its own guardrails during the first pipeline loop by directly editing `01_interviewer.md` instead of flagging it for later execution.

**Root cause:** No way to capture user-requested work that falls outside the current role's scope. The agent defaults to "being helpful" and just does it.

**Proposed fix:**
1. Create `ai_workspace/todo.md` — a shared task list where any role can dump out-of-scope requests, noting which role should handle each item. *(Done)*
2. Strengthen guardrails across all roles to explicitly say: *"If the user requests something outside your scope, add it to `ai_workspace/todo.md` and note which role should handle it. Do not do it yourself."*
3. Add a "TODO Check" step to Session Startup in AGENTS.md — on every session start, check if `todo.md` has items and ask the user whether to address them before proceeding.

**Note:** The user intends to make adjustments to this proposal themselves before handing it off for implementation.
