# Todo Skill Helper

How all roles capture, present, and manage out-of-scope items as individual TODO files.

## Overview

Out-of-scope requests are captured as **todos** — one `.md` file per item in `ai_workspace/TODO/`.

---

## Capturing an Out-of-Scope Item

When you find, or user requests, work outside your scope:
1. **Acknowledge briefly.**
2. **Create file** in `ai_workspace/TODO/` using template below.
3. **Filename:** `TODO_P{N}_{underscore_separated_name}.md` where `{N}` is priority: `P0`=critical, `P1`=high, `P2`=medium, `P3`=low. Examples: `TODO_P2_fix_git_log_truncation.md`, `TODO_P1_add_dark_mode_support.md`.
4. **Fill template fields** with enough context for a future role to act.
5. **Resume current work immediately** — capturing a todo does not count as completing your tasks.

### Creation Template

Copy this into each new todo file:

```markdown
## {Short Title}

- **Captured by:** {Role Name (Role NN)}
- **Date:** {YYYY-MM-DD}
- **Context:** {Brief description of the request and why it is out of scope for the current role.}

## Description

{Detailed description of what should be done when this item is picked up.}

## Notes

{Any additional context, constraints, or references that help a future agent understand the item.}
```

---

## Presenting Pending Items

**Only the Interviewer (Role 01)** scans and presents pending TODOs at session start. All other roles can *capture* new items, but do **not** proactively scan or present existing TODOs at startup.

**Deletion responsibility:** When a loop starts from an existing TODO item, only the Worker (Role 03) deletes that TODO file — and only as part of a planned step included by the Planner. Mid-loop captures (items created during a session for later work) can be deleted by any role whose work satisfies them.

---

## Tracking Completion

- **Loop-start TODOs (addressed from an existing item):** Only the Worker deletes these, as a planned step from the Planner's implementation plan. Other roles must not delete loop-start TODOs.
- **Mid-loop captures (created during a session for later work):** Any role whose work satisfies such a capture may delete it immediately.

---

## TODO Restoration and Archival During Cancellation

When a loop is cancelled per [`cancel_guide.md`](./cancel_guide.md), the TODO item that started the loop (if any) must be handled according to the user's chosen cancellation path.

### Restore — "Cancel Loop" Path
The user wants to revisit this goal later. The TODO file should be restored as a pending item:
1. After `git reset --hard` restores the working tree, the original TODO file in `ai_workspace/TODO/` is automatically recovered (it existed before the loop).
2. If git reset does not restore it (e.g., the file was never committed), search git history: `git log --diff-filter=D --name-only --format="" -- "ai_workspace/TODO/"` to find the deletion commit, then recover with `git show <commit-before-deletion>:<path> > ai_workspace/TODO/<filename>.md`.
3. Verify the file exists in `ai_workspace/TODO/` after restoration.

### Archive — "Cancel Entirely" Path
The user wants to abandon this goal permanently:
1. After `git reset --hard` restores the working tree (and thus the TODO file), move it to an archive:
   - Create `ai_workspace/TODO/archive/` if it doesn't exist.
   - Move the file: rename with `_cancelled_{YYYY-MM-DD}` suffix appended before `.md`. Example: `TODO_P2_add_cancel_support.md` → `ai_workspace/TODO/archive/TODO_P2_add_cancel_support_cancelled_{YYYY-MM-DD}.md`.
2. If archive directory creation fails, simply delete the file and note this to the user.

### No TODO Involved
If the loop started from a fresh goal (not from an existing TODO item), skip restoration/archival entirely. Just perform git reset and `loop_state.md` deletion per [`cancel_guide.md`](./cancel_guide.md).

---

## Rules

- **One file per item.** Do not combine unrelated requests.
- **Descriptive filenames** at creation — no numbering scheme needed.
- **Stay in your lane.** Capturing a todo is administrative — it does not expand scope or delay current tasks.
