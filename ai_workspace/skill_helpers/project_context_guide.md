# Project Context Guide

Canonical specification for creating and maintaining `ai_workspace/project_context.md`. This is the single source of truth — both the init flow (Interviewer via `init_project_guide.md`) and the Finalizer role use this guide.

---

## Purpose

`project_context.md` gives every downstream role a concise, accurate picture of what has been built, how it works, and what to watch out for. It is read at session startup by all roles and updated only by:

- **Init flow** (Interviewer via `init_project_guide.md`) — creates the file from scratch during onboarding.
- **Finalizer role** — updates incrementally after each pipeline loop.

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
| `Known Issues` | Optional | Problems flagged by users, reviewers, or testers that need attention. Remove items once resolved. If none exist, write "None." |
| `Recent Changes` | Optional | Brief entries of what changed in recent pipeline loops (newest first). Populated over time by the Finalizer. Initially empty or omitted on first creation. |
| `Current Pipeline State` | Optional | History of completed pipeline loops with a one-line summary each. Added organically by Finalizers across loops — not present during initial creation. See "Updating Across Loops" below. |

---

## Creating from Scratch (Init Flow)

Used by the Interviewer via `init_project_guide.md` Step 5 when onboarding a new or existing project.

Create `ai_workspace/project_context.md` using this template:

```markdown
# Project Context

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

## Known Issues
<Anything the user flagged as problematic or needing attention, or "None." if none>

## Recent Changes
<Initially empty — populated by pipeline loops over time>
```

Do **not** include `Current Pipeline State` on first creation — that section is added organically by Finalizers after the first loop completes.

---

## Updating Across Loops (Finalizer Flow)

Used by the Finalizer role after squashing commits at the end of each pipeline loop. Update to reflect **current state only** — do not append raw iteration history (that lives in git via the `[ai-finalizer]` commit).

### What to Update

1. **Recent Changes** — Prepend a new entry describing what was built or changed this loop, with today's date. Keep entries brief (one line each). Remove old entries if the list grows beyond ~5 items.

2. **Current Pipeline State** — If this section exists, append a new loop record:
   ```
   - **Loop N** — Complete. Squashed by Finalizer.
   - Work this loop: <brief summary>
   ```
   If the section does not yet exist (e.g., first loop), create it with the header and the first entry.

3. **Known Issues** — Add any new issues discovered during testing or review. Remove resolved items. Keep current only.

4. **File Structure / Architecture Overview / Tech Stack** — Update these sections if the project's structure, architecture, or dependencies changed meaningfully this loop. If nothing structural changed, leave them as-is.

5. **Key Design Decisions** — Append new decisions only if significant architectural choices were made during the loop.

### What Not to Do

- **Do not append raw iteration logs.** Loop records are in git via squashed commits.
- **Do not modify code, tests, or documentation** beyond what is needed for an accurate context file.
- **Keep it concise but complete.** Every role reads this at startup — accuracy matters more than brevity, but avoid unnecessary detail.

---

## Rules

- **Reflect current state only.** This file describes the project as it exists now, not its history.
- **One source of truth.** Both init and finalizer flows reference this guide — do not carry inline templates elsewhere that diverge from this spec.
- **Mandatory sections always present.** Even if content is minimal (e.g., "None." for Known Issues), the section header should exist.
- **Optional sections added when relevant.** `Recent Changes` and `Current Pipeline State` evolve over time — their absence on first creation is expected.
