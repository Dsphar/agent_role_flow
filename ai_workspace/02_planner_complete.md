# 02 — Planner Complete

## Goal Summary
Reorder commit message format: tag at end, remove -- separator

## Architecture Overview
This is a documentation/formatting change only. No code or behavioral logic is modified. The commit message pattern shifts from prefix-based (`[ai-{role-name}] -- {body}`) to suffix-based (`{body} [ai-{role-name}]`). All references across pipeline files are updated for consistency.

## File/Module Map
- **Modify:** `AGENTS.md` — send-back commit format description (line 18)
- **Modify:** `ai_workspace/roles/transition_guide.md` — git commit command construction (step 5)
- **Modify:** `ai_workspace/roles/01_Interviewer.md` — Goal Summary format reference in Deliverables section
- **Modify:** `ai_workspace/project_context.md` — design decision and iteration history notes referencing old format
- **Modify:** `ai_workspace/todo.md` — remove completed "Reorder Commit Message Format" TODO item

## Ordered Implementation Steps

1. **Update AGENTS.md (line 18):** Replace `Commit prefix: [ai-{role-name}-sendback], separator -- .` with a description of the new suffix format, e.g., `Tag appended at end of commit message as [ai-{role-name}-sendback]. No separator.`

2. **Update transition_guide.md (step 5):** Change the git commit command from:
   - Old: `git commit -m "{prefix determined in step 2} -- {commit body from step 4}"`
   - New: `git commit -m "{commit body from step 4} {prefix determined in step 2}"`

3. **Update 01_Interviewer.md (Deliverables section):** Remove the parenthetical `(after [ai-{role-name}] -- )` since the tag is now appended at the end with no separator. Replace with a note that the Goal Summary is used as the commit body, with the role tag appended at the end.

4. **Update project_context.md:** Update all references to the old format:
   - Design decisions bullet: `[ai-{role-name}] -- <goal summary>` → `<goal summary> [ai-{role-name}]`
   - Send-back suffix note: update accordingly
   - Finalizer reset commit note: `[ai-finalizer]` stays as-is (no body separator to change)
   - Iteration history entries referencing the old format

5. **Remove completed TODO from todo.md:** Delete the "Reorder Commit Message Format — Tag at End, Remove Double Dash" entry from the Pending section.

## Risks and Open Questions
- **None identified.** This is a well-scoped text replacement across 4-5 files with no behavioral changes. The Tester should verify all references are caught (grep for `[ai-{role-name}] --` or `-- {commit body` patterns).

---

## Send-Back Summary
Addressed two bugs found by the Tester that originated from an incomplete file map:
- Added **Step 6** to update `ai_workspace/roles/07_finalizer.md` (line 27: old commit format `[ai-finalizer] -- <short description>` → `<short description> [ai-finalizer]`; line 36: "prefix" terminology → "tag appended at end").
- Updated file/module map to include `07_finalizer.md` as a sixth modified file.
- No new risks introduced — same straightforward text replacement pattern.
