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

**Only the Interviewer (Role 01)** scans and presents pending TODOs at session start. All other roles can *capture* new items and *delete* completed ones, but do **not** proactively scan or present existing TODOs at startup.

---

## Tracking Completion

When a role's work satisfies a todo: **Delete** the file from `ai_workspace/TODO/`. Optionally note in your `loop_state.md` section which todo was addressed. Delete all satisfied files together if multiple completed in one pass.

---

## Rules

- **One file per item.** Do not combine unrelated requests.
- **Descriptive filenames** at creation — no numbering scheme needed.
- **Stay in your lane.** Capturing a todo is administrative — it does not expand scope or delay current tasks.
