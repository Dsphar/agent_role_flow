## Planner auto-selects recommended pipeline config on user non-answer

- **Captured by:** Planner (Role 02)
- **Date:** 2026-07-15
- **Context:** Out of scope for the current loop. The Planner asks skip-docs and test-level questions at the end of its session, but if the user doesn't directly answer (e.g., says "c" or gives a vague response), the Planner should default to the recommended options instead of waiting or guessing.

## Description

Update `02_planner.md` so that when the user does not clearly answer the pipeline configuration questions at the end of the Planner stage, the Planner automatically uses **the options it already recommended** for those specific questions — which are determined at runtime based on the task context.

The Planner should still present both questions with its recommended option first ("Option A (recommended) or Option B?"), but if the user's response is ambiguous, non-committal, or just an acknowledgment like "c" / "ok" / "sure", treat it as acceptance of whatever the Planner recommended for that particular task.

**Important:** The auto-select must **not** use hard-coded defaults (e.g., always `skip_docs=yes` and `test_level=deep`). It should accept whichever option the Planner itself flagged as "(recommended)" during its runtime assessment of the current loop's scope.

## Notes

- This aligns with the existing user-facing prompt convention: "Option A (recommended) or Option B?" where "yes" = recommended/default.
- The Planner already evaluates task context to pick a recommendation per AGENTS.md conventions — this just makes the auto-select fallback explicit when the user doesn't answer directly.
- May also apply to other roles that ask similar binary-choice prompts mid-pipeline (e.g., Tester's skip-docs prompt), but start with Planner only.
