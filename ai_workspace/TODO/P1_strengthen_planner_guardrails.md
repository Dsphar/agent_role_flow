## Strengthen Planner Guardrails Against Doing Implementation Work

- **Captured by:** Planner (Role 02) — send-back session
- **Date:** 2026-07-12
- **Context:** The Planner role has been observed to be over-eager to complete work itself rather than preparing a plan and handing off to the Worker. This violates the sequential pipeline design where roles stay in their lane.

## Description

Strengthen the guardrails in `ai_workspace/roles/02_planner.md` so the Planner strictly produces plans only and never writes implementation code, creates project files, or scaffolds directories. Consider:

- Adding stronger/more explicit language in "What You Must Not Do" section
- Adding a positive "What You Should Do" checklist that reinforces planning-only behavior
- Possibly adding examples of what constitutes acceptable vs. unacceptable Planner output
- Reviewing the `AGENTS.md` "During a Role Session" section for any reinforcement needed there as well

## Observations

- **Send-back mode correlation (2026-07-12):** During this send-back cycle, the Planner was tasked with two small specification clarifications (EC-04, EC-08) but applied them directly to `04_tester.md` and `transition_guide.md` — effectively doing Worker-level implementation work. This suggests guardrails may be breaking down more frequently in send-back mode specifically. Investigate whether the send-back instructions implicitly encourage hands-on fixing rather than planning-only behavior.

## Notes

This is a meta-improvement to the pipeline system itself, not a project feature. The fix would involve editing `02_planner.md` and possibly `AGENTS.md`.
