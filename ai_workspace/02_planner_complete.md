# 02 — Planner Complete

## Implementation Plan

### Scope
Pipeline restructuring: reorder Summarizer before Reviewer, rename Version Controller to Finalizer, add doc review capability to the Reviewer. Configuration/documentation-only changes — no code modifications.

### Ordered Steps

1. **Add documentation review to Reviewer (05)**
   - Add new task section "Review Documentation Quality" with rubric for accuracy, completeness, clarity, consistency
   - Replace guardrail "Do not modify project documentation" with: "Do not write or edit documentation; your role is to assess it. Flag issues for the Summarizer to address."

2. **Rename Version Controller → Finalizer (07)**
   - Rename `07_version_controller.md` → `07_finalizer.md`
   - Update all internal references ("Version Controller" → "Finalizer")
   - Update summary filename reference (`07_version_controller_complete.md` → `07_finalizer_complete.md`)

3. **Update AGENTS.md pipeline table**
   - Swap steps 05 and 06 so Summarizer comes before Reviewer
   - Rename step 07 from Version Controller to Finalizer (file name and summary file)

4. **Verify consistency** — check no stale references remain

### Files Modified
- `ai_workspace/roles/05_reviewer.md`
- `ai_workspace/roles/07_version_controller.md` → renamed to `07_finalizer.md`
- `AGENTS.md`

### Risks
Low risk — markdown-only edits with clear before/after states. No runtime behavior changes.
