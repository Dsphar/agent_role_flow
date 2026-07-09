# 02 — Planner Complete

## Architecture Overview
This is a documentation-only change to two markdown files in `ai_workspace/roles/`. No application code, config, or infrastructure is affected. The goal is symmetry between the Tester and Reviewer roles in how they handle send-back decisions.

### Key Design Decisions
- **User-prompted over automatic:** Both roles will ask the user before creating a send-back file. This gives the human control — not every bug needs an immediate pipeline interruption.
- **Two options presented:** (1) Create `send_back_to_worker.md` for next-session routing, or (2) Add to `todo.md` for deferral to a future loop.
- **Symmetric structure:** Both roles get a dedicated subsection with the same format — header, numbered steps, user prompt language.

## File/Module Map

| Action | File | Change |
|--------|------|--------|
| Modify | `ai_workspace/roles/04_tester.md` | Add new send-back subsection; clean up old inline reference in "Execute Tests and Report Results" |
| Modify | `ai_workspace/roles/06_reviewer.md` | Rename and update "Auto Send-Back on Critical Issues" to user-prompted behavior |
| Modify | `ai_workspace/todo.md` | Remove completed TODO item "Make Send-Back Mechanism Visible in Tester Role" |

## Ordered Implementation Steps

1. **Update `04_tester.md` — Clean up old inline reference.** In the "Execute Tests and Report Results" section, remove the send-back instructions currently buried inside the bug diagnosis bullet. Keep the bug classification (Bug vs Flaky test) but strip out the file-creation details.

2. **Update `04_tester.md` — Add new subsection.** After "Execute Tests and Report Results", add a new `### Send-Back on Bugs` subsection with:
   - On any test failure, present findings to the user.
   - Ask whether to (a) create `send_back_to_worker.md` with header `Source: Tester (Role 04)` + bug list, or (b) add to `todo.md` for later.
   - If send-back is chosen, inform the user it triggers Worker role on next session start.

3. **Update `06_reviewer.md` — Rename and update existing subsection.** Change `### Auto Send-Back on Critical Issues` to `### Send-Back on Critical Issues`. Update content from automatic creation to:
   - On finding Critical issues, present findings to the user.
   - Ask whether to (a) create/append `send_back_to_worker.md` with header `Source: Reviewer (Role 06)` + issue list, or (b) add to `todo.md` for later.
   - If send-back is chosen and file already exists (e.g., from Tester), append findings — do not overwrite.
   - Inform the user it triggers Worker role on next session start.

4. **Update `ai_workspace/todo.md` — Remove completed item.** Delete the "Make Send-Back Mechanism Visible in Tester Role" entry (title, description, and surrounding separators). This item originated from `ai_workspace/todo.md` per the Interviewer summary.

## Risks and Open Questions
- **None identified.** This is a straightforward markdown edit to two existing files with clear before/after states. The Worker has all context needed.
