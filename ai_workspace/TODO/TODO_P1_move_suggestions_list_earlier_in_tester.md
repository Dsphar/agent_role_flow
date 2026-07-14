## Move Suggestions list earlier in Tester skill file

- **Captured by:** Documenter (Role 05)
- **Date:** 2026-07-13
- **Context:** The numbered "Suggestions" list was added to the end of `ai_workspace/roles/04_tester.md` as part of the Deliverables section. Because it appears at the very bottom of the file, after the Skip-Docs Prompt section, the Tester presents suggestions and skip-docs options close together in a session. The numbered format of both lists can confuse users when picking options — e.g., "pick suggestion 2" vs "option 2 for skip-docs".

## Description

Move the **Suggestions** deliverable item from its current position at the end of the file (in Deliverables, after Recommendation) to an earlier section so it is presented to the user at a different time during the session. Possible approaches:

- Move Suggestions into its own task section that runs **before** "Execute Tests and Report Results" or before the Skip-Docs Prompt section.
- Alternatively, keep it in Deliverables but change the format (e.g., bullet points instead of numbers) to avoid collision with numbered user-choice prompts.

The goal is temporal separation: suggestions should be presented and resolved *before* the skip-docs prompt appears at transition time.

## Notes

- The Suggestions list was added in this pipeline loop per Interviewer/Planner scope.
- See `ai_workspace/roles/04_tester.md` — current location is the last bullet under Deliverables.
- Skip-Docs Prompt section sits just above "What You Must Not Do" and Deliverables.
