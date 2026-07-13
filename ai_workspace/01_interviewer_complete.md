## Goal Summary
Add skip-docs prompt to Tester at transition [ai-interviewer]

---

## What Is Being Built or Changed
A new capability for the **Tester (Role 04)** that lets users opt out of the documentation step when all tests pass. This adds a user choice point at the Tester → Documenter handoff.

## Why It Matters / Success Criteria
- Saves a session turn when documentation isn't needed for a given pipeline loop.
- The pipeline still functions correctly — Reviewer loads next since `05_documenter_complete.md` exists as a stub.
- **Success criteria:** After tests pass, the Tester asks whether to skip docs; if yes, it creates a minimal `05_documenter_complete.md` stub alongside its own summary and transitions normally.

## Technical Constraints and Preferences
- Only trigger after **tests pass** — no skip option on test failures.
- The preemptive `05_documenter_complete.md` should be a **minimal stub**: note that docs were skipped by the user, include a brief recap of what was built (pulled from prior `_complete.md` files).
- Decision is made at **transition time only** — no mid-session reconsideration logic needed.
- No extra logging required; Finalizer handles pipeline-level logging naturally.
- Scoped to **Tester → Documenter skip only** for now (not generalized to other role skips yet).

## Files Expected to Change
- `ai_workspace/roles/04_tester.md` — primary changes (add skip-docs prompt and stub creation logic)
- Possibly `ai_workspace/skill_helpers/transition_guide.md` — if transition rules need clarification for this flow

## Edge Cases or Special Considerations
- The minimal stub should still follow the `_complete.md` naming convention (lowercase).
- If this pattern proves useful, it could be generalized to other role skips in future loops — but that is explicitly out of scope for this iteration.
- Completed TODO: `ai_workspace/TODO/P2_tester_skip_documentation_handoff.md`
