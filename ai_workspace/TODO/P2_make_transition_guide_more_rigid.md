## Make Transition Guide More Rigid to Prevent Skipping Git Commits

- **Captured by:** Planner (Role 02)
- **Date:** 2026-07-13
- **Context:** The Planner skipped the git commit step during auto-handoff despite it being explicitly documented in `transition_guide.md` as step 4. The current structure nests git commits under "Write summary and commit" with sub-steps, making them easy to overlook when rushing through handoff.

## Description

Restructure `ai_workspace/skill_helpers/transition_guide.md` so the git commit steps are harder to miss. Consider:
- Making git commit its own top-level numbered step (not nested under "Write summary and commit").
- Adding a mandatory checklist at the end of the transition flow that must be verified before declaring handoff complete.
- Adding explicit language like "**Do not skip this — every role must commit**" or similar guardrail phrasing.

## Notes

- The current guide has clear instructions; the issue is structural visibility, not missing content.
- All roles reference this file during transition, so any change affects the entire pipeline.
