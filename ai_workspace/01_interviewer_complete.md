## Goal Summary
Add multi-round questioning capability to Interviewer role skill file [ai-interviewer]

---

## What Is Being Built or Changed
Update `ai_workspace/roles/01_Interviewer.md` to instruct the Interviewer to use optional multi-round questioning during discovery sessions.

## Why It Matters (Goals / Success Criteria)
- Current Interviewer asks questions in a single pass — may miss ambiguities that only surface after hearing initial answers
- Multi-round approach lets the agent probe deeper based on what it learns, producing better-scoped problem statements for the Planner
- Closes TODO item: "Add Optional Multi-Round Questioning to Interviewer" (captured by user, 2026-07-10)

## Technical Constraints and Preferences
- **Automatic trigger** — kicks in whenever needed regardless of project type (new or existing)
- **Agent autonomously judges** whether follow-ups are needed after digesting answers
- **Maximum 3 rounds** of questions total; no limit to number of questions per round
- **Natural flow** into subsequent rounds — no explicit "round N" announcements to the user
- **Hard stop at round 3** — if uncertainties remain, flag them explicitly for the Planner

## Edge Cases or Special Considerations
- Must not conflict with existing Interviewer behavior (startup TODO check, new vs. existing project flows)
- The multi-round logic should integrate cleanly into both "New Project" and "Existing Project" interview flows
- Item origin: `ai_workspace/todo.md` — Planner should plan its removal upon completion
