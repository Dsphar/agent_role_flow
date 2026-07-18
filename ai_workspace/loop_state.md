**Goal Summary:** Add Tester instructions to consult project overview for test stack<br>
**Current Role:** Planner (Role 02) | History: Interviewer<br>
**Pipeline Config:** test_level=skip | skip_docs=yes<br>
---
## Interviewer (Role 01) — Complete

### Goal Summary
Add instructions to the Tester role so it consults `project_overview.md` for existing test stack, patterns, and conventions before designing tests.

### What Was Discussed
- User wants the Tester to proactively check `project_overview.md` to discover:
  - Test frameworks, runners, assertion libraries already in use
  - Naming schemes, directory structure, mock strategies, fixture patterns
  - Known coverage gaps or infrastructure limitations
- This ensures tests align with established project conventions rather than introducing new ones

### Technical Constraints and Preferences
- Small change — single instruction file edit (`04_tester.md`)
- New section placed before test planning so it naturally informs the plan

### Additional Items Captured
- **TODO captured:** `TODO_P2_add_gitignore_to_init_and_reviewer.md` — Add `.gitignore` generation to init project guide and a verification step in Reviewer role. To be addressed in a future loop.

### Edge Cases or Special Considerations
None identified. Straightforward instruction addition.
