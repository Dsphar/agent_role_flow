## Fix Skip-Docs Prompt "Yes" Assumption

- **Captured by:** Tester (Role 04) — send-back session
- **Date:** 2026-07-13
- **Context:** During the skip-docs prompt, asking "should I prepare for documenter handoff, or skip documentation?" and receiving "yes" was interpreted as "skip documentation." This is ambiguous — "yes" could mean either option depending on how the question is phrased.

## Description

Update the skip-docs prompt logic so that:

1. The Tester presents options **in order of recommendation** (e.g., if proceeding normally is recommended, list it first).
2. A bare "yes" response maps to the **first/recommended option**, not the second one.
3. Alternatively, rephrase the question to be unambiguous — e.g., "Tests passed. I recommend proceeding to documentation. Would you like me to skip docs and go straight to review?" where "yes" = skip docs, "no" = proceed normally.

## Notes

- This affects the Tester role's `Skip-Docs Prompt` section in `ai_workspace/roles/04_tester.md`.
- The fix should also consider other binary-choice prompts across roles that might have similar ambiguity (e.g., send-back vs defer decisions).
- Consider a general pattern: always present options as "Option A (recommended) or Option B?" so "yes" = recommended choice.
