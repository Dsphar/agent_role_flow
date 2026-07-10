# TODO — Out-of-Scope Requests

Items captured by roles when the user requests work that falls outside their current scope.

## Pending

### Move In-Progress Files Instructions to AGENTS.md (captured by user, 2026-07-10)
- The "In-progress files" section in `transition_guide.md` describes the optional `{NN}_rolename_in_progress.md` pattern.
- This info should live in `AGENTS.md` instead so roles know about it from session startup, not just at transition time.
- Move the instructions (and possibly the filename casing note) into AGENTS.md; remove or reference from `transition_guide.md`.

### Improve Finalizer Transition — Explicit Custom Reset Flow (captured by Tester, 2026-07-10)
- The Finalizer's skill file does not explicitly reference `transition_guide.md` for its post-commit handoff messaging. It relies on AGENTS.md's general instruction to reach the hard-stop message.
- Since the Finalizer is the last role and resets `_complete.md` files, it needs a **custom transition flow** that clearly describes clearing loop state and preparing the workspace for a new pipeline iteration.
- Rename "Execute Single-Commit Reset Flow" to something more aligned with this purpose (e.g., "Loop Reset and Handoff" or similar).
- Add explicit instruction in `07_finalizer.md` to follow its own reset/handoff flow after presenting the final recap, rather than depending on an implicit cross-reference.

### Enforce Return-to-Role After Capturing TODOs (captured by Tester, 2026-07-10)
- Agents get distracted after adding a `todo.md` entry and stop their main work instead of continuing.
- Add guidance to AGENTS.md or role skill files reminding the agent: **after capturing a TODO, return immediately to your current role and continue where you left off.**
- Consider making this an explicit step in the "out-of-scope request" flow so it's not optional.

### Make Documenter Role More Rigid About Completing Tasks (captured by user, 2026-07-10)
- The Documenter skipped its actual documentation duties and transitioned early after capturing a TODO.
- Update `ai_workspace/roles/05_documenter.md` to enforce that the role must complete its core tasks before transitioning.
- Consider adding explicit completion criteria or guardrails preventing premature transitions.



