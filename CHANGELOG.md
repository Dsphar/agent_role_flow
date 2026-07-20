# Changelog

Notable changes to the AI agent sequential-pipeline system.

## [Unreleased]

### Added
- `.gitignore` generation step (Step 4b) in `init_project_guide.md` — guides Interviewer to create `.gitignore` with global patterns and language-specific patterns referencing [github/gitignore](https://github.com/github/gitignore). Includes skip-if-exists logic for existing projects.
- `.gitignore` verification sub-task in Reviewer role (`06_reviewer.md`) — existence check (Critical/send-back if missing), exception path for legitimate cases, spot-check for build artifacts, dependency dirs, env files, and OS/IDE noise.
