Source: Tester (Role 04)

# Bug Fix Required: Send-Back Commit Prefix Never Applied

## Problem
The `[ai-{role-name}-sendback]` commit prefix in AGENTS.md can never be applied. The send-back flow deletes `send_back_to_worker.md` before the Worker reaches its transition git commit, so the prefix check always falls through to normal `[ai-{role-name}]`.

## Desired Fix (Not Just a Patch)
Restructure the send-back flow so that:

1. **When creating the send-back file** (Tester/Reviewer role), after writing `send_back_to_worker.md`:
   - Make an immediate git commit with a `[sendback]` prefix to preserve the file in the repo.
   - This commit captures the state *before* fixes begin, anchoring what was sent back and why.

2. **All commits during send-back context** should use the `[ai-{role-name}-sendback]` prefix — not just one role's transition commit. This means:
   - The commit that creates `send_back_to_worker.md` (Tester/Reviewer) → `[ai-tester-sendback]` or `[ai-reviewer-sendback]`
   - Any commits while the Worker is fixing send-back items → `[ai-worker-sendback]`

3. **Delete `send_back_to_worker.md`** only after all fixes are resolved and confirmed — as it currently does. But since the file was already committed, deleting it doesn't lose history.

## Files to Modify
- `AGENTS.md` — Update both "Send-Back Detection" section (Session Startup) and "Transitioning Between Roles" git commit step to implement this flow.
