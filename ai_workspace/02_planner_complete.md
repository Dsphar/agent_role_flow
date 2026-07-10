## Goal Summary
Add multi-round questioning capability to Interviewer role skill file [ai-planner]

---

## Architecture Overview

The change is a **single-file edit** to `ai_workspace/roles/01_Interviewer.md`. No new files, no structural changes. The multi-round logic is added as a behavioral guideline within the existing "Both Flows" section so it naturally applies to both New and Existing project interview paths without duplicating prose.

### Key Design Decisions
- **Inline with "Both Flows"** rather than a standalone section — keeps the skill file compact and ensures the rule applies universally regardless of which flow was taken.
- **"What You Must Not Do" unchanged** — multi-round questioning is pure discovery behavior, already within the Interviewer's lane.
- Uncertainties at hard stop go directly into `_complete.md` as requested — no separate artifact needed.

---

## File/Module Map

| Action | File | Change |
|--------|------|--------|
| Modify | `ai_workspace/roles/01_Interviewer.md` | Add multi-round questioning instructions in "Both Flows" section; update summary guidance to include uncertainty flags at round 3 hard stop |

---

## Ordered Implementation Steps

1. **Add multi-round questioning block inside "### Both Flows"** — insert after the existing bullet points and before the `todo.md` note. The new text should instruct the Interviewer to:
   - After receiving answers, digest them and judge whether follow-up questions are needed.
   - If yes, ask naturally (no "Round N" announcements).
   - Allow up to **3 rounds total** (initial + 2 follow-ups). No limit on questions per round.
   - At round 3 hard stop: if uncertainties remain, flag them explicitly in the `_complete.md` summary under a new note within "Edge cases or special considerations."

2. **Update the `todo.md` reference bullet** — it already exists and is fine as-is (no change needed).

3. **Add final step to remove completed TODO from `ai_workspace/todo.md`** — since this loop addresses the item "Add Optional Multi-Round Questioning to Interviewer," the Worker should remove that entry upon completion.

---

## Risks and Open Questions
- None identified. The change is small, well-scoped, and stays within the Interviewer's existing responsibilities.

---

## Send-Back Summary

Addressed Reviewer send-back: **Round Counting Ambiguity** in `ai_workspace/roles/01_Interviewer.md`.

### Planned Fix
Add a brief tracking note to the "Multi-Round Questioning (Automatic)" section so the agent knows to maintain its own round counter:

> Allow a **maximum of 3 rounds total** (initial + up to 2 follow-ups) — **track your current round internally through conversation context**. No limit on the number of questions per round.

Single-line edit. Worker will apply it, then hand off back to Reviewer for re-check.
