# Project Overview Guide

Canonical specification for creating and maintaining `ai_workspace/project_overview.md`. This is the single source of truth — both the init flow (Interviewer via `init_project_guide.md`) and the Finalizer role use this guide.

---

## Purpose

`project_overview.md` gives every downstream role a concise, accurate picture of what has been built, how it works, and key architectural decisions. It is read at session startup by all roles and updated only by:

- **Init flow** (Interviewer via `init_project_guide.md`) — creates the file from scratch during onboarding.
- **Finalizer role** — updates as needed after each pipeline loop (structural changes only).

---

## Canonical Structure

Every section below is listed as **mandatory** or **optional**. Mandatory sections must always be present; optional sections are added when relevant content exists.

| Section | Required? | Description |
|---------|-----------|-------------|
| `What This Is` | Mandatory | Concise description of the project(s) and their purpose. |
| `File Structure` | Mandatory | Tree or structured overview of key directories and files outside `ai_workspace/`. Include the `ai_workspace/` layout if it is part of the orchestration system itself. |
| `Architecture Overview` | Mandatory | How components interact, data flow, deployment model, pipeline mechanics (if applicable). |
| `Tech Stack` | Mandatory | Languages, frameworks, databases, infrastructure, key dependencies — listed as bullet points. |
| `Key Design Decisions` | Mandatory | Architectural or technical decisions made and the rationale behind them. |
| `User-Preferred Patterns` | Optional | Coding patterns, conventions, or stylistic preferences expressed by the user. Placeholder section until populated. |

---

## What Does Not Belong Here

The following types of content do **not** belong in `project_overview.md`. They have their own tracking mechanisms:

| Content Type | Where It Belongs Instead |
|--------------|--------------------------|
| Recent changes / changelog entries | Git log (`[ai-pipeline]` commit messages) |
| Loop history / iteration counts | Git log (squashed `[ai-pipeline]` commits per loop) |
| Known issues / bug tracking | `send_back.md` (active), git issues, or project issue tracker |
| Raw iteration logs | Git log — each `[ai-pipeline]` commit captures the loop's outcomes |

This file is a **stable architectural reference**, not a living changelog. Dynamic data belongs in version control history.

---

## Creating from Scratch (Init Flow)

Used by the Interviewer via `init_project_guide.md` Step 5 when onboarding a new or existing project.

Create `ai_workspace/project_overview.md` using this template:

```markdown
# Project Overview

## What This Is
<Concise description of the project(s) and their purpose>

## File Structure
<Tree or structured overview of key directories and files>

## Architecture Overview
<How components interact, data flow, deployment model>

## Tech Stack
- **Language(s):** ...
- **Framework(s):** ...
- **Database(s):** ...
- **Infrastructure:** ...
- **Key Dependencies:** ...

## Key Design Decisions
<List any architectural or technical decisions made and why>

## User-Preferred Patterns
_(No user-preferred patterns recorded yet. Add here when identified.)_
```

---

## Updating Across Loops (Finalizer Flow)

Used by the Finalizer role after squashing commits at the end of each pipeline loop. Update to reflect **current structural state only** — do not append raw iteration history or changelog entries.

### What to Update

1. **File Structure / Architecture Overview / Tech Stack** — Update these sections if the project's structure, architecture, or dependencies changed meaningfully this loop. If nothing structural changed, leave them as-is.

2. **Key Design Decisions** — Append new decisions only if significant architectural choices were made during the loop.

3. **User-Preferred Patterns** — Add entries when the user expresses coding preferences or conventions worth preserving across loops.

### What Not to Do

- **Do not add changelog entries, recent changes, or loop history.** That data lives in git via `[ai-pipeline]` commit messages.
- **Do not track known issues here.** Active issues use `send_back.md`; resolved issues are captured in git history.
- **Do not modify code, tests, or documentation** beyond what is needed for an accurate overview file.
- **Keep it concise but complete.** Every role reads this at startup — accuracy matters more than brevity, but avoid unnecessary detail.

---

## Rules

- **Reflect current state only.** This file describes the project as it exists now, not its history.
- **One source of truth.** Both init and finalizer flows reference this guide — do not carry inline templates elsewhere that diverge from this spec.
- **Mandatory sections always present.** Even if content is minimal, the section header should exist.
- **Optional sections added when relevant.** `User-Preferred Patterns` starts as a placeholder and grows organically.