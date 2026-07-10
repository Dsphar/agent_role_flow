## Goal Summary
Hard stop at end of role handoffs — no auto-load next role

# Planner Complete

## Architecture Overview
Surgical edit to `transition_guide.md` only. Two existing lines replaced, one line removed. AGENTS.md requires no changes since its startup detection logic already correctly identifies the next role from `_complete.md` files.

### Key Decisions
- **Scope:** Only `transition_guide.md` is modified — steps 4 (final line) and step 5.
- **Hard-stop message:** After a successful commit, inform the user that the handoff is ready and instruct them to clear their session so the next role loads on fresh start via normal startup detection.
- **Send-back mode:** Same hard stop applies — no special handling needed since the commit step (and thus the post-commit message) is shared between normal and send-back flows.
- **Finalizer reset:** Also hard-stops after its `[ai-finalizer]` commit — consistent behavior across all roles.

## File/Module Map
| File | Action | Details |
|------|--------|---------|
| `ai_workspace/transition_guide.md` | Modify | Replace step 4 final line + remove step 5 |
| `ai_workspace/todo.md` | Modify | Remove "Hard Stop Between Role Handoffs" entry (completed this loop) |

## Ordered Implementation Steps

1. **Edit step 4's final line in `transition_guide.md`:**
   - Find: `Announce the role is complete and introduce the next role.`
   - Replace with: a hard-stop message that says the handoff is ready, instructs the user to clear their session, and notes that starting a new session will auto-load the next role via normal startup detection.

2. **Remove step 5 from `transition_guide.md`:**
   - Delete the line: `On the next interaction, re-run **Session Startup** (AGENTS.md) to load the new current role.`
   - This is no longer applicable since the user clears their session and starts fresh.

3. **Verify edge cases:** Confirm the changes apply correctly to send-back mode transitions and Finalizer reset — both should hard-stop after commit with the same messaging.

4. **Remove completed TODO item from `ai_workspace/todo.md`:** Delete the "Hard Stop Between Role Handoffs" entry since this loop addresses it. Keep all other pending items intact.

## Risks and Open Questions
- **No technical risks** — this is a small prose edit to a markdown file.
- Wording of the hard-stop message should be concise but clear enough that users understand they need to start a new session.
