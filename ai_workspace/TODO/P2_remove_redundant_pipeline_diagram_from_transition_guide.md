## Remove Redundant Pipeline Diagram from Transition Guide

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-12
- **Context:** The "Pipeline and Send-Back Routes" section with its ASCII diagram exists in both `transition_guide.md` and `sendback_guide.md`. This is redundant — the sendback guide's version is better formatted.

## Description

Remove or consolidate the duplicate pipeline/send-back routes content:

1. Review the "Pipeline and Send-Back Routes" section in `ai_workspace/skill_helpers/transition_guide.md` (includes ASCII diagram + routing summary).
2. Compare with the same section in `ai_workspace/skill_helpers/sendback_guide.md` — the sendback guide's diagram is better formatted and more complete.
3. Either remove the redundant section from `transition_guide.md` entirely, or replace it with a cross-reference to `sendback_guide.md`.

## Notes

- The sendback guide's diagram uses cleaner formatting (role numbers in boxes, clearer arrows).
- The transition guide's version is shorter but less detailed — keeping both creates two sources of truth for pipeline routing.
- Low severity; purely a cleanup/consolidation task.
