Source: Reviewer (Role 06)
Current Role: Planner (Role 02)

## Issues to Fix

### S1: Add filename casing note to transition guide
Summary filenames (`*_complete.md`, `*_in_progress.md`) are always lowercase regardless of role skill file casing. The transition guide and AGENTS.md should explicitly state this so agents don't create mismatched filenames like `06_Reviewer_complete.md`.

**Recommended fix:** Add a clarifying note in `ai_workspace/transition_guide.md` (In-Progress Files section or Transitioning Between Roles) stating that summary filenames always use lowercase role names.

### S2: Add send-back routing diagram to transition guide
The send-back chain is described in text across multiple roles but not visualized centrally. A simple ASCII diagram would make the routing clearer at a glance.

**Recommended fix:** Add an ASCII diagram in `ai_workspace/transition_guide.md` showing the full pipeline and send-back routes (e.g., Tester→Planner, Reviewer→Planner).

## Send-Back Log
