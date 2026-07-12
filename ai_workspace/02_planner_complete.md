# 02 — Planner Complete

## Goal Summary
Extract in_progress guidance into a dedicated skill helper [ai-interviewer]

## Architecture Overview
New file `ai_workspace/skill_helpers/in_progress_guide.md` serves as the single source of truth for `_in_progress.md` lifecycle (creation, usage, resume-on-restart, rename at completion). All three current source files are trimmed to brief references pointing there. AGENTS.md retains a pointer rather than removing all mention.

## File/Module Map
- **Create:** `ai_workspace/skill_helpers/in_progress_guide.md`
- **Modify:** `AGENTS.md`, `ai_workspace/roles/03_worker.md`, `ai_workspace/skill_helpers/transition_guide.md`
- **Delete:** `ai_workspace/todos/extract-in-progress-skill-helper.md`

## Ordered Implementation Steps

1. **Create `in_progress_guide.md`** with consolidated content:
   - Purpose and naming convention (`{NN}_rolename_in_progress.md`, lowercase role names)
   - When to create (optional for most roles; mandatory checklist for Worker from Planner steps)
   - How to use during a session (notes, progress tracking, `[x]` marking for Worker)
   - Resume-on-restart behavior (pick up from next incomplete step)
   - Transition-time rename (`_in_progress.md` → `_complete.md`)
   - "Going Back" rule (keep the file when reverting to a prior role)

2. **Update `AGENTS.md`:**
   - Replace the entire "In-Progress Files" subsection under Session Startup with a brief reference pointing to `skill_helpers/in_progress_guide.md` for full details on in-progress file usage, naming, and lifecycle.
   - In "Going Back", replace "keep any `_in_progress.md`" with "follow `skill_helpers/in_progress_guide.md`."

3. **Update `03_worker.md`:**
   - Replace "Initialize In-Progress File" task body with a reference to the new helper + brief Worker-specific note (checklist from Planner steps).
   - Replace "Track Progress" task body with a reference to the new helper.

4. **Update `transition_guide.md`:**
   - Replace the inline rename logic ("If `{NN}_rolename_in_progress.md` exists, rename it…") with a reference to the new helper.

5. **Delete `todos/extract-in-progress-skill-helper.md`** (todo addressed this loop).

## Risks and Open Questions
- None identified — straightforward content relocation with references replacing inline instructions.

---

## Send-Back Summary

**Source:** Tester (Role 04) — missing in-progress file check in AGENTS.md startup sequence.

**Fix applied:** Added step 5 to the Role Detection numbered list in `AGENTS.md`. Every role now checks for its own `{NN}_rolename_in_progress.md` on startup and reads it if present, with a reference to `skill_helpers/in_progress_guide.md` for full resume behavior. Existing steps renumbered 6–9.

**Files modified:**
- `AGENTS.md`

[ai-planner-sendback]
