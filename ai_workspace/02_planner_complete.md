## Goal Summary
Enforce return-to-role after capturing TODOs in AGENTS.md

# Planner Complete — Enforce Return-to-Role After Capturing TODOs

## Architecture Overview
Single text insertion into `AGENTS.md` under the **"During a Role Session"** section. No new files, no structural changes to the pipeline. The rule is a cross-cutting behavioral guardrail that applies to all 7 roles equally.

### Key Decisions
- **Placement:** Under "During a Role Session" — this is where agents reference their working behavior mid-task, making it the natural encounter point when an out-of-scope request arrives.
- **Explicitness:** Two clear sub-rules: (1) resume work immediately after capturing, and (2) capturing a TODO does not count as completing your role's tasks or justify early transition.

## File/Module Map
| Action | File | Details |
|--------|------|---------|
| Modify | `AGENTS.md` | Add a new bullet under "During a Role Session" with the return-to-role rule |

No other files touched.

## Ordered Implementation Steps

1. **Read current `AGENTS.md`** — locate the "During a Role Session" section and identify the insertion point (after existing bullets, before "Transitioning Between Roles").

2. **Add the return-to-role rule** as a new bullet under "During a Role Session":
   - After capturing an out-of-scope request into `ai_workspace/todo.md`, acknowledge it briefly then immediately resume your current role's work where you left off.
   - Capturing a TODO does not count as completing your role's tasks — do not transition early or stop working because you logged something.

3. **Verify no conflict with send-back flow** — confirm the new text doesn't overlap with existing `send_back.md` instructions (which live under "Session Startup" and are handled separately).

4. **Remove completed TODO item from `ai_workspace/todo.md`** — move "Enforce Return-to-Role After Capturing TODOs" from Pending to Completed (or remove it), since this pipeline loop addresses it.

## Risks and Open Questions
- **Risk:** The phrasing must be strong enough to actually change behavior but not so verbose that AGENTS.md bloats. Keep it to ~2 concise bullets.
- **No open questions** — scope is clear from the Interviewer summary and user confirmation.
