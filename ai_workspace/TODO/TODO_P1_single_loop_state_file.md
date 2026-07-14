## Replace Per-Role _complete Files with Shared _loop_state.md

- **Captured by:** Finalizer (Role 07)
- **Date:** 2026-07-13
- **Context:** User wants to consolidate state tracking from multiple per-role `_complete.md` files into a single shared `ai_workspace/_loop_state.md` file. This is out of scope for the Finalizer role.

## Description

Replace the current model where each role creates its own `{NN}_rolename_complete.md` with a single shared state file: `ai_workspace/_loop_state.md`.

### First Line — Current Role + Handoff History
The first line of `_loop_state.md` defines the current active role and carries handoff history using arrows. As roles complete and hand off, they append to this line:

- **Active role** shown in normal text.
- **Completed roles** shown in ~~strikethrough~~.
- Roles connected by `→` arrows showing transition order.

Example progression:
```
Current Role: ~~Interviewer (Role 01)~~ → ~~Planner (Role 02)~~ → Worker (Role 03)
```

When the Worker completes and hands off to Tester:
```
Current Role: ~~Interviewer (Role 01)~~ → ~~Planner (Role 02)~~ → ~~Worker (Role 03)~~ → Tester (Role 04)
```

### Body — Appended Per-Role Summaries
Below the first line, each role appends its own summary section to `_loop_state.md` when it completes. This replaces writing a separate `_complete.md` file. Format could be:

```markdown
---
## Interviewer (Role 01) — Complete
{summary content}

## Planner (Role 02) — Complete
{summary content}
```

### Roles That Need Updating
- **AGENTS.md** — Role detection logic changes from scanning `{nn}_*_complete.md` files to reading `_loop_state.md`. Transition logic changes from creating `_complete.md` to appending to `_loop_state.md`.
- **All role skill files (01–07)** — Deliverables and transition behavior updated to use the shared file instead of per-role complete files.
- **transition_guide.md** — Rewrite to reflect single-file append model instead of per-role file creation + rename.
- **in_progress_guide.md** — May need updates if `_loop_state.md` interacts with in-progress tracking.

## Notes

- This is a significant architectural change to the pipeline's state management — affects every role and multiple skill helper guides.
- The handoff history line provides at-a-glance visibility into where the loop is and what has been done, which is an improvement over scanning for missing `_complete.md` files.
- Consider whether `_loop_state.md` should be deleted by the Finalizer (like current `_complete.md` files) or preserved across loops as a historical record.
- The `send_back.md` file's "Current Role:" line would need to stay consistent with this new format so send-back detection still works.
- **Send-back mode indicator:** When in send-back mode, the current role pointer should use an `(in-sendback)` suffix (e.g., `Tester (Role 04) (in-sendback)`). This suffix replaces the separate `send_back.md` file as the mechanism for detecting send-back state — roles check for this suffix on the first line to determine if they're in send-back mode or normal flow.
