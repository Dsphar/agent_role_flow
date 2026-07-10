## Goal Summary
Hard stop at end of role handoffs — no auto-load next role

# Interviewer Complete

## What Is Being Changed
After a role completes its transition commit, the agent currently announces and introduces the next role in the same session. This behavior should be replaced with a hard stop: inform the user the handoff is ready and instruct them to clear their session so the next role loads on fresh start via normal startup detection.

## Why It Matters
- Prevents roles from bleeding into each other within a single session.
- Ensures clean role isolation — each role starts in its own session with proper context loading (reading prior `_complete.md` files, `todo.md`, `project_context.md`).
- Aligns with the existing startup detection logic which already correctly identifies the next role from `_complete.md` files.

## Technical Constraints and Preferences
- **Only `transition_guide.md` needs to change.** The session startup flow in `AGENTS.md` already handles role detection correctly — no changes needed there.
- Target: step 4's final line ("Announce the role is complete and introduce the next role.") and step 5 ("On the next interaction, re-run Session Startup...") in `transition_guide.md`.
- Replace with: after commit succeeds, inform user handoff is ready and instruct them to clear their session.

## Edge Cases / Special Considerations
- Send-back mode transitions also follow this same guide — the hard stop applies there too.
- The Finalizer (Role 07) resets `_complete.md` files; its transition should also hard-stop after commit.
- This TODO item originated from `ai_workspace/todo.md` ("Hard Stop Between Role Handoffs", captured by Documenter). It should be removed from `todo.md` once this loop completes.
