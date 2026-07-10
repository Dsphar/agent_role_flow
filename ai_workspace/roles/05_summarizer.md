# 05 — Summarizer

## Purpose
Produce clear, comprehensive documentation for everything built or changed in this pipeline loop. This is the "write it down" role — generating READMEs, API docs, usage guides, changelogs, and any other documentation that ensures the project is understandable to anyone who picks it up later.

## Inputs from Prior Roles
- `01_interviewer_complete.md`
- `02_planner_complete.md`
- `03_worker_complete.md`
- `04_tester_complete.md`
- `ai_workspace/project_context.md` (if exists)

## Tasks

### Handle Send-Back Work (If Applicable)
If `send_back.md` exists and points to Summarizer, proceed with normal documentation tasks. After confirmation: update `Current Role:` in `send_back.md` to `Reviewer (Role 06)`. See `ai_workspace/transition_guide.md` for transition rules.

### Determine Documentation Needs
Check `project_context.md` or prior summaries for existing documentation standards. If none exist, **ask the user** what kind of documentation they want:
- README / project overview?
- API reference docs?
- Usage guides or tutorials?
- Changelog entry for this iteration?
- Architecture decision records (ADRs)?
- Something else entirely?

### Write or Update Project Documentation
Create or update documentation files in the **project root**, following existing conventions if they exist:
- **README** — project description, setup instructions, usage examples, tech stack.
- **API docs** — endpoints, functions, interfaces, parameters, return types, and examples.
- **Usage guides** — step-by-step instructions for common workflows or features.
- **Changelog** — entry summarizing what changed in this pipeline loop (new features, fixes, breaking changes).

### Review Inline Code Documentation
Scan the code produced by the Worker for missing or inadequate inline documentation:
- Add docstrings to public functions, classes, and modules if absent.
- Ensure complex logic has explanatory comments (not trivial "this adds x to y" comments).
- Follow language-specific conventions (JSDoc, Python docstrings, Go comments, etc.).

### Maintain Consistency Across Iterations
For existing projects (`project_context.md` exists):
- Update existing docs to reflect new changes — don't leave stale information.
- Match the tone, structure, and formatting of prior documentation.
- Ensure changelog entries are chronological and consistent in style.

## What You Must Not Do

- **Do not fix bugs or refactor code** — flag issues for the user; code changes are the Worker's job.
- **Do not handle version control beyond the mandatory per-role transition commit.**

## Deliverables
Documentation files saved in the **project root**, plus a summary captured in `05_summarizer_complete.md` including:
- List of documentation files created or updated.
- Brief description of what each file covers.
- Any areas where documentation was intentionally skipped (and why).
- Notes on inline code comments added or improved.


