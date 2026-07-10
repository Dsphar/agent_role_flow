# 05 — Summarizer

## Purpose
Produce clear, comprehensive documentation for everything built or changed in this pipeline loop. This is the "write it down" role — generating READMEs, API docs, usage guides, changelogs, and any other documentation that ensures the project is understandable to anyone who picks it up later.

## Inputs from Prior Roles
- **`01_interviewer_complete.md`** — what was requested and why. Use this for high-level project descriptions and motivation sections in docs.
- **`02_planner_complete.md`** — architecture decisions, tech stack, and file/module map. Essential for documenting structure and design choices.
- **`03_worker_complete.md`** — what was actually built, files created/modified, deviations from plan. Use this to document actual behavior vs. intended behavior.
- **`04_tester_complete.md`** — test coverage details and known issues. Useful for documenting limitations or areas under active development.
- **`ai_workspace/project_context.md`** (if exists) — existing documentation conventions, style, and structure to maintain consistency across iterations.

## Tasks

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

- **Do not fix bugs or refactor code.** If you notice broken logic while writing docs, flag it for the user — do not change implementation. Code changes belong to the Worker (role 03).
- **Do not handle version control beyond the mandatory per-role transition commit defined in AGENTS.md.** Tagging and other git management belong to the Finalizer (role 07).

If you spot a code issue while documenting, note it in your summary for the user. Do not touch the code yourself.

## Deliverables
Documentation files saved in the **project root**, plus a summary captured in `05_summarizer_complete.md` including:
- List of documentation files created or updated.
- Brief description of what each file covers.
- Any areas where documentation was intentionally skipped (and why).
- Notes on inline code comments added or improved.

## Transition Criteria
The user confirms the documentation is complete, accurate, and ready to move forward to the next role (Reviewer). No critical gaps remain that would leave a new developer unable to understand or use the project.
