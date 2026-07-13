# 02 — Planner Complete

## Architecture Overview

This change adds a single decision point at the end of the Tester's session. When all tests pass, the Tester prompts the user with: *"Tests passed, should I prepare for documenter handoff, or skip documentation?"* If the user chooses to skip, the Tester creates a minimal `05_documenter_complete.md` stub before transitioning normally.

No new files are created — only existing role skill file content is modified. The transition guide may need a minor clarification note.

## File/Module Map

| File | Action |
|---|---|
| `ai_workspace/roles/04_tester.md` | Modify — add skip-docs prompt and stub creation logic |
| `ai_workspace/skill_helpers/transition_guide.md` | Possibly modify — clarify that Tester may pre-create the next `_complete.md` stub |
| `ai_workspace/TODO/P2_tester_skip_documentation_handoff.md` | Delete (completed TODO) |

## Ordered Implementation Steps

1. **Read `04_tester.md`** in full to understand current session flow and transition behavior.
2. **Add the skip-docs prompt** near the end of the Tester's tasks section — after all testing is complete and results are confirmed passing, instruct the Tester to ask: *"Tests passed, should I prepare for documenter handoff, or skip documentation?"*
3. **Define the skip behavior:** If user says yes/skip, create a minimal `05_documenter_complete.md` stub containing only that docs were skipped by user request and a one-line recap of what was built (pulled from prior `_complete.md` summaries). Then proceed to normal transition.
4. **Clarify guardrails in the prompt section:** Only offer this choice when tests pass — never on test failures. The decision is made once at transition time.
5. **Update `transition_guide.md`** if needed to note that a role may pre-create the next `_complete.md` stub as part of its own completion (Tester-specific behavior).
6. **Delete `ai_workspace/TODO/P2_tester_skip_documentation_handoff.md`** — this TODO was addressed by the Interviewer and is now being implemented.

## Risks and Open Questions

- None identified. This is a small, well-scoped change to a single role file with clear user interaction semantics.

---

## Send-Back Summary

Addressed two specification clarifications sent back from the Tester:

1. **EC-04** — Updated "Running Again During Send-Back Mode" in `04_tester.md` to explicitly state the skip-docs prompt is offered during send-back re-runs when tests pass (same as first-run).
2. **EC-08** — Added undo mechanism notes to both `04_tester.md` and `transition_guide.md`: user can delete the pre-created stub before next session to restore normal pipeline flow.

### Files Modified
- `ai_workspace/roles/04_tester.md` — Two clarifications added
- `ai_workspace/skill_helpers/transition_guide.md` — Undo mechanism note added [ai-planner-sendback]
