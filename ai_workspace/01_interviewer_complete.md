## Goal Summary
Move in-progress file instructions from transition_guide to AGENTS.md

# Interviewer Summary — Move In-Progress Files Instructions to AGENTS.md

## What Is Being Changed
Move the "In-Progress Files" instructions (optional `{NN}_rolename_in_progress.md` pattern) from `ai_workspace/transition_guide.md` into `AGENTS.md` as a new subsection. Remove that content from the transition guide. Keep the filename casing note in `transition_guide.md`.

## Why It Matters
Roles currently learn about the `_in_progress.md` pattern only at transition time (via `transition_guide.md`). Moving it to `AGENTS.md` ensures roles know about it at session startup, where the Conflict Check already references these files.

## Technical Constraints and Preferences
- New subsection in `AGENTS.md`, placed after the existing "Conflict Check" section.
- Remove only the in-progress file instructions from `transition_guide.md`; keep the filename casing note blockquote intact.
- No behavioral changes — purely relocating documentation.

## Edge Cases or Special Considerations
- The Conflict Check already mentions `_in_progress.md` files — ensure the new subsection complements rather than duplicates that text.
- After removal, verify `transition_guide.md` still reads cleanly (no orphaned header if "### In-Progress Files" becomes just the casing note).

## Origin
This loop addresses todo.md item #1: "Move In-Progress Files Instructions to AGENTS.md" (captured by user, 2026-07-10). The Planner should plan its removal from `todo.md`.
