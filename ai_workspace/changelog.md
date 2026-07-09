# Changelog

## Loop 2 — Pipeline Restructure + Auto Send-Back (2026-07-09)

### Changed
- **Pipeline order** — Summarizer moved before Reviewer. New order: Worker → Tester → Summarizer → Reviewer → Finalizer. Rationale: documentation should be reviewed as part of the quality gate, not written after review is complete.
- **`ai_workspace/roles/05_reviewer.md`** → renamed to `06_reviewer.md`. Added "Review Documentation Quality" task section with rubric for accuracy, completeness, clarity, consistency. Replaced guardrail "Do not modify project documentation" with "Do not write or edit documentation; your role is to assess it. Flag issues for the Summarizer to address."
- **`ai_workspace/roles/06_summarizer.md`** → renamed to `05_summarizer.md`. Updated cross-references and summary filename.
- **`ai_workspace/roles/07_version_controller.md`** → renamed to `07_finalizer.md`. Updated title and all internal references. "Finalizer" better reflects the role's purpose as the pipeline's closing step.
- **AGENTS.md** — updated role pipeline table to reflect new ordering (Summarizer 05, Reviewer 06) and rename (Finalizer 07).

### Added
- **Auto send-back mechanism** — Tester and Reviewer can now create `ai_workspace/send_back_to_worker.md` when bugs or critical issues are found. On next session start, AGENTS.md detects this file and loads the Worker role immediately to fix them. After fixes are confirmed, `_complete.md` files for roles at and after the sending role are deleted so validation re-runs through to the end.
- **AGENTS.md** — new "Send-Back Detection" step in Session Startup (before normal role detection).
- **`ai_workspace/roles/03_worker.md`** — "Handle Send-Back Work" task section. Also fixed stale references: Reviewer → role 06, Summarizer → role 05, Version Controller → Finalizer.

### Fixed
- Stale cross-role references in `03_worker.md` and `04_tester.md` (Reviewer was listed as role 05, Summarizer as role 06 — now corrected).
- "Version Controller" reference in `03_worker.md` guardrails → updated to "Finalizer (role 07)".

### Known Issues
- None new. Prior known issue (guardrail enforcement) remains open per `todo.md`.

---

## Loop 1 — Pipeline Improvements (2026-07-09)

### Changed
- **AGENTS.md** — trimmed from ~130 to ~85 lines. Removed redundant sections: "Role Skill File Template" (docs-only), "Key Rules" (pure duplication of workflow sections), and "Resetting the Pipeline" (lives in role 07's skill file). Tightened prose throughout.
- **AGENTS.md** — added general "Stay in your lane" guardrail under "During a Role Session".

### Added
- **`ai_workspace/roles/02_planner.md`** — "What You Must Not Do" section (don't write code, create files, or scaffold projects).
- **`ai_workspace/roles/03_worker.md`** — "What You Must Not Do" section (don't test, review, document, or handle git).
- **`ai_workspace/roles/04_tester.md`** — "What You Must Not Do" section (don't fix bugs, do reviews, or write project docs).
- **`ai_workspace/roles/05_reviewer.md`** — "What You Must Not Do" section (don't implement fixes, write tests, or modify docs).
- **`ai_workspace/roles/06_summarizer.md`** — "What You Must Not Do" section (don't fix code/refactor or handle version control).
- **`ai_workspace/roles/07_version_controller.md`** — "What You Must Not Do" section (don't modify prior work or alter role summaries).
- **`ai_workspace/roles/01_interviewer.md`** — "What You Must Not Do" section (don't plan, build, or make architectural decisions). *Note: added by Reviewer during loop 1 in violation of its own guardrails.*
- **`ai_workspace/todo.md`** — created as a shared task list for out-of-scope requests. Contains one pending item: guardrail enforcement fix.

### Known Issues
- Reviewer broke its own guardrails during this loop by directly editing `01_interviewer.md`. Fix proposed and captured in `todo.md` for future implementation.
