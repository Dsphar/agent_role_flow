# Todo Skill Helper

Defines how all roles capture, present, and manage out-of-scope items as individual todo (TODO) files.

---

## Overview

When a role receives a request that falls outside its current scope, it captures the item as a **todo** — one `.md` file per item inside `ai_workspace/TODO/`. This replaces any monolithic todo list and gives each item its own trackable record.

---

## Capturing an Out-of-Scope Item

When you find, or the user requests, work outside your role's scope:

1. **Acknowledge briefly** — confirm you heard the request.
2. **Create a new file** in `ai_workspace/TODO/` using the template below.
3. **Choose a descriptive filename** using the format `TODO_P{N}_{underscore_separated_name}.md` where `{N}` is the priority level:
   - `P0` — critical (blocks progress, must fix immediately)
   - `P1` — high (important, address soon)
   - `P2` — medium (nice to have, normal backlog)
   - `P3` — low (minor improvement, low urgency)

   Examples: `TODO_P2_fix_git_log_truncation.md`, `TODO_P1_add_dark_mode_support.md`.
4. **Fill in the template fields** with enough context for a future role to act on it.
5. **Resume your current work** immediately — capturing a todo does not count as completing your role's tasks.

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

**Only the Interviewer (Role 01)** scans and presents pending TODO items at session start. The Interviewer's skill file contains explicit instructions for this.

All other roles retain the ability to *capture* new out-of-scope items as TODO files and to *delete* completed ones, but they do **not** proactively scan or present existing TODO files at startup.

---

## Tracking Completion

When a role's work satisfies a todo item:

1. **Delete** the corresponding file from `ai_workspace/TODO/`.
2. Optionally note in your `_complete.md` summary which todo was addressed (e.g., "Addressed `TODO_P2_fix_git_log_truncation.md`").

If multiple items are completed in one pass, delete all satisfied files together.

---

## Rules

- **One file per item.** Do not combine unrelated requests into a single file.
- **Descriptive filenames** chosen at creation time — no numbering scheme needed.
- **No stale references to `todo.md`.** The old monolithic file has been replaced; all role cross-references now point here.
- **Stay in your lane.** Capturing a todo is administrative — it does not expand your scope or delay your current tasks.
