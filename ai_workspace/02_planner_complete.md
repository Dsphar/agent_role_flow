# 02 — Planner Complete

## Goal Summary
Rename project_context to project_overview, narrow scope to stable info only

---

## Architecture Overview

This is a **rename + content narrowing** across the orchestration system itself. Two files are renamed and rewritten; ~10 other files have their references updated. No new files or directories are created. The change is purely within `ai_workspace/` — no project root artifacts are touched.

### Key Design Decisions
- **Rename to `project_overview.md`** — clearer name that signals "stable architectural reference" rather than a living changelog.
- **Drop dynamic sections entirely** — `Known Issues`, `Recent Changes`, and `Current Pipeline State` are removed from both the file and its guide. That data belongs in git log / `[ai-finalizer]` commits, not in a startup-context file.
- **Keep stable sections** — `What This Is`, `File Structure`, `Architecture Overview`, `Tech Stack`, `Key Design Decisions`. Add a placeholder for `User-Preferred Patterns` per the Interviewer's note.
- **Guide rewrite mirrors the narrowing** — `project_overview_guide.md` explicitly defines what belongs vs. doesn't belong so future roles maintain scope discipline.

---

## File/Module Map

### Renamed (2 files)
| Old Path | New Path |
|----------|----------|
| `ai_workspace/project_context.md` | `ai_workspace/project_overview.md` |
| `ai_workspace/skill_helpers/project_context_guide.md` | `ai_workspace/skill_helpers/project_overview_guide.md` |

### Rewritten (2 files — same as above)
- **`project_overview.md`** — New content: stable sections only. Dynamic data from current file is discarded per user request.
- **`project_overview_guide.md`** — New content: canonical spec for the narrower scope, with explicit "what belongs / what doesn't" rules.

### References Updated (10 files)
Every occurrence of `project_context.md`, `project_context_guide.md`, and the phrase "Project Context" (as a guide title/header) is replaced with the new names:

| File | Approximate Reference Count |
|------|----------------------------|
| `AGENTS.md` | 1 |
| `ai_workspace/roles/01_Interviewer.md` | ~6 |
| `ai_workspace/roles/02_planner.md` | 1 |
| `ai_workspace/roles/03_worker.md` | 1 |
| `ai_workspace/roles/04_tester.md` | 3 |
| `ai_workspace/roles/05_documenter.md` | 3 |
| `ai_workspace/roles/06_reviewer.md` | 1 |
| `ai_workspace/roles/07_finalizer.md` | ~8 (most references) |
| `ai_workspace/skill_helpers/init_project_guide.md` | ~4 |

### Deleted (0 files)
- No deletions beyond the rename (git handles this as a rename).

---

## Ordered Implementation Steps

1. **Rename `project_context.md` → `project_overview.md`.** Move `ai_workspace/project_context.md` to `ai_workspace/project_overview.md`.

2. **Rewrite `project_overview.md` with stable-only content.** Using the existing file as source material, produce a new version containing only:
   - `# Project Overview` (header)
   - `## What This Is` — concise project description
   - `## File Structure` — tree of key directories/files
   - `## Architecture Overview` — how components interact
   - `## Tech Stack` — languages, frameworks, tools
   - `## Key Design Decisions` — architectural choices and rationale
   - `## User-Preferred Patterns` — placeholder section (no content yet per Interviewer note)

   Remove: `Known Issues`, `Current Pipeline State`, `Recent Changes`. Do not carry forward any of their content.

3. **Rename `project_context_guide.md` → `project_overview_guide.md`.** Move `ai_workspace/skill_helpers/project_context_guide.md` to `ai_workspace/skill_helpers/project_overview_guide.md`.

4. **Rewrite `project_overview_guide.md`.** Restructure the guide around the narrower scope:
   - Update title and all internal references from "Project Context" / `project_context.md` to "Project Overview" / `project_overview.md`.
   - Canonical Structure table: keep only stable sections (`What This Is`, `File Structure`, `Architecture Overview`, `Tech Stack`, `Key Design Decisions`, `User-Preferred Patterns`). Remove `Known Issues`, `Recent Changes`, `Current Pipeline State` from the table.
   - "Creating from Scratch" template: reflect only the stable sections.
   - "Updating Across Loops" section: simplify to structural updates only (File Structure, Architecture Overview, Tech Stack, Key Design Decisions). Remove instructions for updating Recent Changes, Current Pipeline State, and Known Issues since those sections no longer exist.
   - Add explicit "What Does Not Belong Here" section listing: recent changes/changelog entries, loop history/iteration counts, known issues/bug tracking, raw iteration logs — with guidance on where that data belongs instead (git log, `[ai-finalizer]` commits).

5. **Update `AGENTS.md`.** Replace the reference in Role Detection step 7 from `project_context.md` to `project_overview.md`.

6. **Update `ai_workspace/roles/01_Interviewer.md`.** Replace all ~6 references:
   - Check for existence of `project_overview.md` (not `project_context.md`)
   - Init guide produces initial `project_overview.md`
   - Read `project_overview.md` for current project state
   - Section headers referencing "no `project_overview.md` exists" / "`project_overview.md` exists"

7. **Update `ai_workspace/roles/02_planner.md`.** Replace the input reference from `project_context.md` to `project_overview.md`.

8. **Update `ai_workspace/roles/03_worker.md`.** Replace the input reference from `project_context.md` to `project_overview.md`.

9. **Update `ai_workspace/roles/04_tester.md`.** Replace all 3 references:
   - Input section: `project_overview.md` (if exists)
   - "Check `project_overview.md` or the Planner's summary for testing preferences"
   - "If `project_overview.md` exists, run existing tests..."

10. **Update `ai_workspace/roles/05_documenter.md`.** Replace all 3 references:
    - Input section: `project_overview.md` (if exists)
    - "Check `project_overview.md` or prior summaries for documentation standards"
    - "For existing projects (`project_overview.md` exists)"

11. **Update `ai_workspace/roles/06_reviewer.md`.** Replace the input reference from `project_context.md` to `project_overview.md`.

12. **Update `ai_workspace/roles/07_finalizer.md`.** This has the most references (~8). Replace all:
    - Input section: `project_overview.md` (if exists)
    - Guide reference: `skill_helpers/project_overview_guide.md` for creating/updating `project_overview.md`
    - Delete step: "Do NOT delete `project_overview.md`"
    - Stage step: `git add ai_workspace/project_overview.md`
    - Fallback commit: stage `project_overview.md` + deleted files
    - Deliverables: "Updated `ai_workspace/project_overview.md` reflecting this iteration's outcomes"
    - Update the Finalizer's update instructions to match the new narrower scope (structural updates only, no more appending Recent Changes / Pipeline State)

13. **Update `ai_workspace/skill_helpers/init_project_guide.md`.** Replace all ~4 references:
    - "Loaded by the Interviewer when `project_overview.md` does not yet exist"
    - Step 5 title and body: write `project_overview.md` following `project_overview_guide.md`
    - Post-confirmation step referencing `project_overview.md`

14. **Verify no stale references remain.** Run a grep across the entire project for `project_context` to confirm zero hits outside of `_complete.md` summary files (which are historical records and can retain old names).

---

## Risks and Open Questions

- **No major technical risks** — this is a straightforward rename + content edit across markdown files.
- The existing `project_overview.md` (currently `project_context.md`) contains valuable stable content in its first 5 sections that should be preserved during the rewrite. Steps 2 and 4 are careful to retain this while discarding only the dynamic sections.
- **No open questions** — scope is clear from the Interviewer summary.
