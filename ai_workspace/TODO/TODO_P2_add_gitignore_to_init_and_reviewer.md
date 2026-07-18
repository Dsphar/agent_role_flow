## Add Git Ignore Support to Init Project Guide and Reviewer Role

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-07-17
- **Context:** The init project guide does not currently instruct the agent to create a `.gitignore` file based on the chosen tech stack. Additionally, there is no step in the Reviewer role to verify that appropriate files are being ignored. This is out of scope for the current loop (which is focused on Tester improvements).

## Description

1. **Update `init_project_guide.md`:** Add a step that generates an appropriate `.gitignore` file based on the project's chosen tech stack (e.g., Node.js, Python, Rust, etc.). Should include common ignores for OS files, IDE configs, build artifacts, dependencies, and environment files.

2. **Update Reviewer role (`06_reviewer.md`):** Add a verification step where the Reviewer confirms that `.gitignore` exists and contains appropriate entries for the project's tech stack. Flag if sensitive or build-artifact files are being tracked in git unnecessarily.

## Notes

- Consider using well-known `.gitignore` templates (e.g., from github.com/github/gitignore) as a reference rather than hardcoding lists per language.
- The init guide step should happen after the tech stack is decided but before any project files are created.
- Reviewer check should be lightweight — just verify existence and spot-check for obvious misses, not an exhaustive audit.
