## Fix Send-Back Guide Common Steps Numbering Gap

- **Captured by:** Tester (Role 04)
- **Date:** 2026-07-12
- **Context:** Deep audit found that the "Common Steps" section in sendback_guide.md starts numbering at step 2 instead of step 1, leaving a gap.

## Description

Fix the numbered list in `ai_workspace/skill_helpers/sendback_guide.md` under the "### Common Steps (All Sending Roles)" heading:

1. The current list jumps from the section header to step `2.` ("Ask how to proceed..."), skipping step 1 entirely.
2. Either add a missing step 1 or renumber the existing steps starting at `1.`.
3. Verify the rest of the numbering chain (steps 3 and 4) is correct after the fix.

## Notes

- Pre-existing issue — not introduced in any recent loop.
- Low severity; purely cosmetic but could confuse an agent following the guide literally.
