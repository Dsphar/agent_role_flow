# 02 — Planner Summary

## Goal
Add "What You Must Not Do" guardrail sections to roles 03–07, matching the style already added to role 02 (Planner). Each section should clearly state what the role must NOT do and reference which other role owns that work.

## Files to Modify
All files live in `ai_workspace/roles/`. For each file, insert a new "What You Must Not Do" section **immediately before** the existing "## Deliverables" heading (same pattern used for 02_planner.md).

---

### 03_worker.md — Guardrails to Add
- **Do not write tests.** Testing is the Tester's job (role 04). You may verify your code runs, but do not create test files or test suites.
- **Do not perform code reviews.** Reviewing is the Reviewer's job (role 05). Self-check for obvious errors, but do not produce a review report.
- **Do not write documentation** (READMEs, API docs, usage guides). That is the Summarizer's job (role 06). Inline comments in your own code are fine — external docs are not.
- **Do not handle version control.** Committing, tagging, and git management belong to the Version Controller (role 07).

### 04_tester.md — Guardrails to Add
- **Do not fix bugs in the implementation.** When tests reveal a bug, document it clearly with reproduction steps. Fixing code is the Worker's job (role 03) — recommend going back to that role instead.
- **Do not perform architectural or quality reviews.** That is the Reviewer's job (role 05). Focus on whether things work, not whether they're well-designed.
- **Do not write project documentation** (READMEs, guides, changelogs). That is the Summarizer's job (role 06).

### 05_reviewer.md — Guardrails to Add
- **Do not implement fixes.** Your job is to find and report issues, not resolve them. If critical bugs are found, recommend sending work back to the Worker (role 03) or Tester (role 04).
- **Do not write tests.** Adding missing test coverage is the Tester's responsibility (role 04), not yours.
- **Do not modify project documentation.** That is the Summarizer's job (role 06).

### 06_summarizer.md — Guardrails to Add
- **Do not fix bugs or refactor code.** If you notice broken logic while writing docs, flag it for the user — do not change implementation. Code changes belong to the Worker (role 03).
- **Do not handle version control.** Committing and tagging are the Version Controller's job (role 07).

### 07_version_controller.md — Guardrails to Add
- **Do not modify code, tests, or documentation** beyond what is needed for accurate commits. If you spot issues in prior work, flag them for the user — do not fix them yourself.
- **Do not alter role summaries (`_complete.md` files)** except to create your own `07_version_controller_complete.md`. Those files are final records of each role's work.

---

## Implementation Steps (for Worker)
1. Read `ai_workspace/roles/03_worker.md`, locate the "## Deliverables" heading, and insert a "What You Must Not Do" section before it using the guardrails above.
2. Repeat for `04_tester.md`.
3. Repeat for `05_reviewer.md`.
4. Repeat for `06_summarizer.md`.
5. Repeat for `07_version_controller.md`.

Each inserted section should follow the same format as the one already in `02_planner.md`: a heading "## What You Must Not Do", bullet points with bold lead-ins, and a closing reminder sentence.

## Risks / Open Questions
None — straightforward text insertions into existing files.
