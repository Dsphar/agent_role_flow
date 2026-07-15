# Project Overview Guide

Canonical specification for creating and maintaining `ai_workspace/project_overview.md`. Used by both the init flow (Interviewer via `init_project_guide.md`) and the Finalizer role.

## Purpose

`project_overview.md` gives every downstream role a concise, accurate picture of what has been built, how it works, and key architectural decisions. Read at session startup by all roles; updated only by:
- **Init flow** (Interviewer) — creates from scratch during onboarding.
- **Finalizer role** — updates after each pipeline loop (structural changes only).

## Canonical Structure

| Section | Required? | Description |
|---------|-----------|-------------|
| `What This Is` | Mandatory | Concise description of the project(s) and purpose. |
| `File Structure` | Mandatory | Tree or structured overview of key directories/files outside `ai_workspace/`. Include `ai_workspace/` layout if part of orchestration system itself. |
| `Architecture Overview` | Mandatory | Component interactions, data flow, deployment model, pipeline mechanics (if applicable). |
| `Tech Stack` | Mandatory | Languages, frameworks, databases, infrastructure, key dependencies as bullets. |
| `Key Design Decisions` | Mandatory | Architectural/technical decisions and rationale. |
| `User-Preferred Patterns` | Optional | Coding patterns, conventions, stylistic preferences from user. Placeholder until populated. |

## Creating from Scratch (Init Flow)

Used by Interviewer via `init_project_guide.md` Step 5. Create using this template:

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

## Updating Across Loops (Finalizer Flow)

Used by Finalizer after squashing commits. Update to reflect **current structural state only** — no raw iteration history or changelog entries.

### What to Update
1. **File Structure / Architecture Overview / Tech Stack** — update if structure, architecture, or dependencies changed meaningfully this loop. Otherwise leave as-is.
2. **Key Design Decisions** — append new decisions only if significant architectural choices were made.
3. **User-Preferred Patterns** — add entries when user expresses coding preferences worth preserving across loops.

### What Not to Do
- **No changelog entries, recent changes, or loop history.** That data lives in git via `[ai-pipeline]` commits.
- **Do not track known issues here.** Send-back issues live inline in `loop_state.md` under `### Send-Back Issues` subsections; resolved items are in git history.
- **Do not modify code, tests, or docs** beyond what is needed for an accurate overview file.
- **Keep concise but complete.** Every role reads this at startup — accuracy > brevity, but avoid unnecessary detail.

## Rules
- **Reflect current state only.** Describes project as it exists now, not its history.
- **One source of truth.** Both init and finalizer flows reference this guide — do not carry divergent inline templates elsewhere.
- **Mandatory sections always present.** Even if content is minimal, the header should exist.
