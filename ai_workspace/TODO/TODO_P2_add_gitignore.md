## Add .gitignore File to Project Root

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-20
- **Context:** Pre-existing issue found during code review. No `.gitignore` file exists at the project root despite the project containing TypeScript/Node.js files (`.pi/extensions/auto-loop.ts`) and various build/runtime artifacts that should be excluded from version control.

## Description

Create a `.gitignore` file at the project root covering:
- Node.js artifacts (`node_modules/`, `dist/`, `build/`, `*.js` generated from `.ts`)
- Environment files (`.env*`)
- OS/IDE noise (`Thumbs.db`, `*.DS_Store`, `.vscode/`, `.idea/`)
- Temporary/log files

Reference [github/gitignore](https://github.com/github/gitignore) templates for Node.js and TypeScript patterns.

## Notes

This is a pre-existing gap, not introduced by the current loop. Deferred as TODO per Reviewer scope-audit policy (issues unrelated to current loop scope are deferred rather than sent back).
