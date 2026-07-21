# TODO: Create .gitignore at Project Root

**Source:** Reviewer (Role 06)
**Date:** 2026-07-20
**Severity:** Critical

## Description

No `.gitignore` file exists at the project root. The project contains TypeScript source files under `.pi/extensions/` and may accumulate build artifacts, dependency directories, environment files, and OS/IDE noise without protection.

## Recommended Action

Create a `.gitignore` covering:
- **TypeScript/Node.js:** `node_modules/`, `dist/`, `build/`, `*.js`, `*.d.ts`, `tsconfig.tsbuildinfo`, `.env*`
- **OS/IDE noise:** `Thumbs.db`, `*.DS_Store`, `.vscode/`, `.idea/`
- **Build artifacts for .pi extensions:** compiled JS output from TypeScript sources

Reference [github/gitignore](https://github.com/github/gitignore) templates for Node.js and TypeScript patterns.
