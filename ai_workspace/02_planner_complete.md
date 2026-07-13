## Goal Summary

Audit init guide, add TODO proposal step, create project context skill helper [ai-planner]

---

## Architecture Overview

This loop has two tracks:

**Track A — Validate Interviewer deliverables.** The Interviewer already completed the work of adding Step 6 (TODO proposal) to `init_project_guide.md` and creating two TODO files. No code changes needed here — just confirm the artifacts are correct and move on.

**Track B — Create `project_context_guide.md`.** Extract a canonical skill helper that defines the structure, creation rules, and update rules for `project_context.md`. Both `init_project_guide.md` (Step 5) and `07_finalizer.md` (Update Project Context task) write this file. Currently each has its own inline understanding of the format — consolidating into one source of truth prevents drift.

### Key Design Decisions
- **Single source of truth:** `project_context_guide.md` becomes the authoritative spec for `project_context.md`. Both consumers reference it instead of carrying their own templates.
- **Two modes in the guide:** "Create from scratch" (init flow) and "Update existing" (finalizer loop flow). This matches how the file is actually used across the pipeline lifecycle.
- **Minimal cross-reference changes:** `init_project_guide.md` Step 5 delegates to the new guide; `07_finalizer.md` Update Project Context task references it. No structural changes to either consumer beyond adding a pointer.

---

## File/Module Map

| Action | File | Purpose |
|--------|------|---------|
| **Create** | `ai_workspace/skill_helpers/project_context_guide.md` | New canonical skill helper defining format, creation, and update rules for `project_context.md` |
| **Modify** | `ai_workspace/skill_helpers/init_project_guide.md` | Step 5: replace inline template with reference to the new guide |
| **Modify** | `ai_workspace/roles/07_finalizer.md` | Update Project Context task: add reference to the new guide |
| **Delete** | `ai_workspace/TODO/create-project-context-guide.md` | Completed TODO — remove after Worker finishes |

---

## Ordered Implementation Steps

### Step 1 — Create `project_context_guide.md`
Create `ai_workspace/skill_helpers/project_context_guide.md` with:
- **Section: Purpose** — What this guide is for and which roles use it.
- **Section: Canonical Structure** — The full set of sections/fields for `project_context.md`, marking each as mandatory or optional. Base this on the template currently in Step 5 of `init_project_guide.md` (What This Is, File Structure, Architecture Overview, Tech Stack, Key Design Decisions, Known Issues, Recent Changes), plus any fields the Finalizer implicitly uses (e.g., Current Pipeline State, Loop history).
- **Section: Creating from Scratch** — Instructions for first-time creation (used by init_project_guide during greenfield or existing-project onboarding). Include the full template.
- **Section: Updating Across Loops** — Instructions for incremental updates after each pipeline loop (used by finalizer). Cover: updating Recent Changes, appending to Current Pipeline State if that section exists, updating Known Issues, refreshing File Structure/Architecture/Tech Stack when they change. Emphasize "reflect current state only" per the Finalizer's existing guidance.
- **Section: Rules** — Concise but complete; do not append iteration history (that lives in git); keep it accurate to current project state.

### Step 2 — Update `init_project_guide.md` Step 5
Replace the inline template block in Step 5 with a reference to the new guide. The step should say something like: "Create `ai_workspace/project_context.md` following [`skill_helpers/project_context_guide.md`](project_context_guide.md)." Remove the now-redundant inline markdown template.

### Step 3 — Update `07_finalizer.md`
In the "Update Project Context" task, add a reference to `project_context_guide.md`. The Finalizer should follow that guide for both creating and updating `project_context.md`, rather than carrying its own implicit understanding.

### Step 4 — Delete Completed TODO
Delete `ai_workspace/TODO/create-project-context-guide.md` since this loop addresses it.

---

## Risks and Open Questions

- **No major risks.** This is a documentation/refactoring change within the orchestration layer only — no runtime code, no external dependencies.
- The current `project_context.md` has sections like "Current Pipeline State" and "Recent Changes" that aren't in the init template (Step 5). These are added organically by Finalizers over loops. The new guide should document this evolution pattern explicitly so a fresh init doesn't conflict with later loop updates.
