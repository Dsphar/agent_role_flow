# Changelog

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
