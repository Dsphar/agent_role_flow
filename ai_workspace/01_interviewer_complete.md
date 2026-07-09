# 01 — Interviewer Complete

## Origin
This iteration addresses **TODO #2: Make Send-Back Mechanism Visible in Tester Role** from `ai_workspace/todo.md`. During the interview, scope was expanded to also update the Reviewer role for consistency.

## What Is Being Changed
Two role skill files need updates so that send-back behavior is both more visible and user-controlled rather than automatic:

### Tester (`04_tester.md`)
- Add a new dedicated subsection under Tasks (e.g., `### Send-Back on Bugs`) mirroring the Reviewer's existing structure for symmetry.
- On any test failure, **prompt the user** with options: create `send_back_to_worker.md`, or add as a TODO item instead. No more automatic send-back creation.
- Remove/clean up the existing inline send-back mention buried inside "Execute Tests and Report Results" to avoid duplication.

### Reviewer (`06_reviewer.md`)
- Rename/update `### Auto Send-Back on Critical Issues` to reflect user-prompted behavior (e.g., `### Send-Back on Critical Issues`).
- On finding Critical issues, **prompt the user** with options: create `send_back_to_worker.md`, or add as a TODO item instead. No more automatic send-back creation.
- Maintain the same clear structure — just change from auto to user-decided.

## Why It Matters
- The Tester's send-back instruction is currently buried in a bullet point and easy for agents to miss. A dedicated subsection fixes visibility.
- Making both roles symmetric (matching section structures) reduces confusion about how each role handles bugs/issues.
- Shifting from auto-send-back to user-prompted gives the human more control over workflow decisions — not every bug needs an immediate send-back; some are better tracked as TODOs for later.

## Technical Constraints and Preferences
- Changes are limited to `ai_workspace/roles/04_tester.md` and `ai_workspace/roles/06_reviewer.md`.
- The new subsections should mirror each other in structure (header, numbered steps, user prompt).
- After implementation, the TODO item "Make Send-Back Mechanism Visible in Tester Role" should be removed from `ai_workspace/todo.md`.

## Edge Cases / Special Considerations
- If both roles find issues and create send-backs in the same loop, the file append behavior (Reviewer already handles this) should still work. The Planner should verify no conflict arises if both write to `send_back_to_worker.md`.
- The user prompt should be clear about what each option means — send-back routes to Worker on next session start; TODO defers to a future pipeline loop.

## Success Criteria
- Both role files have clearly visible, standalone send-back sections that prompt the user rather than acting automatically.
- Old inline references are cleaned up without losing meaningful content.
- The two roles remain symmetric in their approach.
- The addressed TODO item is removed from `todo.md`.
