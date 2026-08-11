**Goal Summary:** Create Second Opinion manual adversarial auditor role<br>
**Current Role:** Planner (Role 02) | History: Interviewer<br>
test_level=skip | do_docs=true | can_loop=false<br>

## Interviewer (Role 01) — Complete

### Goal Summary
Create a new manual "Second Opinion" role — an adversarial auditor that reviews `loop_state.md` for design, implementation, testing, documentation, and security issues. Triggered by "Load second opinion" at session start. Presents severity-tiered findings to the user, logs only approved items in its own section of `loop_state.md`, and can trigger a single send-back to the earliest affected role.

### What Is Being Built or Changed
A new manual role file: `ai_workspace/roles/manual_second_opinion.md`. This is an adversarial auditor role that sits **outside** the normal 01→07 pipeline. It is loaded manually via a trigger phrase at session start, not through the standard role-loading flow.

### Success Criteria / Acceptance Conditions
- Trigger phrase "Load second opinion" detected in AGENTS.md startup before Interviewer role loading
- Optional focus targeting supported (e.g., "focus on planning")
- Primary analysis from `loop_state.md`, secondary from git diffs (pre/post loop + per-role)
- Errors gracefully if no `loop_state.md` exists
- Severity tiers: Critical / Important / Cosmetic — only user-selected items logged in its own section of `loop_state.md`
- Own section in `loop_state.md`, cleared by Finalizer at loop end
- Can send-back to any role including Interviewer; one sendback max, user approves
- Reviews everything, including active send-back context
- Pipeline flows naturally after send-back resolution
- "Second Opinion" / "adversarial auditor" persona with "different LLM" framing

### Integration Points
- AGENTS.md — startup flow needs trigger detection before normal role loading
- `ai_workspace/roles/manual_second_opinion.md` — new file to create
- Finalizer (Role 07) — must clear Second Opinion section from `loop_state.md` at loop end
- Existing roles may need awareness of the Second Opinion section in `loop_state.md` (open for Planner to decide: explicit instructions vs. self-describing entries)

### Background / Motivation
The user wants a "second pair of eyes" on pipeline work — especially the Planner's plans — that can spot issues the original LLM may have missed due to confirmation bias. The "different LLM" framing helps break out of that bias. Most common use case: reviewing a Planner's plan before Worker implements it.

### User-Facing Behavior Changes
- New trigger phrase "Load second opinion" available at session start
- README.md updated to document this hidden role for GitHub users

### Clarification Log
- **Q:** Where does it sit in the pipeline? Standalone or new numbered role?
  **A:** A new manual role, does not fit in the normal pipeline.
- **Q:** Trigger detection — should Interviewer detect keywords, or something else?
  **A:** Put the flag in AGENTS.md startup before the Interviewer. "Load second opinion" is the trigger phrase.
- **Q:** Scope of critique — design/implementation only, or broader (tests, docs, security, performance)?
  **A:** Wide open set of eyes — all of those and more. Looking broadly but also closely at details.
- **Q:** Send-back mechanism — one sendback even if multiple roles affected? To earliest role?
  **A:** Yes, one sendback to the first-occurring related role. User approves each sendback.
- **Q:** Naming preference — "Devil's Advocate" or "Second Opinion"?
  **A:** "Second Opinion" with "adversarial auditor" included in persona description. Dropped "Load devil" as the word may poison context.
- **Q:** Should it compare git diffs of each role step?
  **A:** Yes, but as a secondary measure. Primary analysis should come from `loop_state.md`. User plans to use this mostly to analyze Planner's plans where there won't be much git diff.
- **Q:** Error out gracefully if no loop_state.md? Look at pre and post loop state?
  **A:** Yes, error gracefully. Can look at both pre and post loop state via git diffs.
- **Q:** Send-back to Interviewer (Role 01) — how should pipeline handle that?
  **A:** Pipeline plays out naturally, following all roles in order even after/during a Second Opinion sendback.
- **Q:** Persona framing — "different LLM" angle, any other persona elements?
  **A:** Keep "Second Opinion" but include "adversarial auditor" also.
- **Q:** Logging user decisions — persistent or ephemeral section in loop_state.md?
  **A:** Its own section that clears on Finalizer run.
- **Q:** Severity tier system for findings?
  **A:** Yes, good idea. Critical / Important / Cosmetic tiers.
- **Q:** Can it run during an active pipeline (mid-loop)?
  **A:** Can be run at any time during the pipeline, but only called at a fresh new session.
- **Q:** After send-back resolves, does Second Opinion get another pass?
  **A:** No, pipeline flows naturally after sendback.
- **Q:** Focus targeting — can user specify what to review (e.g., "focus on planning")?
  **A:** Yes, focus prompt option is good.
- **Q:** Non-selected findings — should they still be logged for reference?
  **A:** No, if user does not select an item, do not include it in the summary.
- **Q:** Interaction with existing send-back mode — review or skip?
  **A:** Review everything including current sendback context.
- **Q:** File placement — roles folder or guides/skill_helpers folder? Numbered prefix?
  **A:** In roles folder with clear title: `manual_second_opinion.md`. No number prefix to avoid confusing future agents.
- **Q:** Should existing roles have explicit instructions to ingest Second Opinion section, or rely on self-describing entries in loop_state.md?
  **A:** Open for Planner — the Second Opinion summary should include its own context telling the current role that an adversarial reviewer has made notes. May not need extra instructions in every role file.
- **Q:** What testing level this loop? Quick, Deep, or Skip? (Recommended: Skip)
  **A:** Skip
- **Q:** Include documentation this loop? Yes or No? (Recommended: Yes — update README)
  **A:** Yes

### Edge Cases or Special Considerations
- The role must handle being invoked when no `loop_state.md` exists (first session ever, or between loops after Finalizer cleanup)
- Must handle active send-back context gracefully — reviewing everything including current send-back state
- Only one sendback allowed even if findings span multiple roles; target the earliest affected role in pipeline order
