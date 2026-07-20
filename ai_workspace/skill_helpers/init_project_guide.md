# Project Initializer Guide

Loaded by the Interviewer when `project_overview.md` does not yet exist. Build a thorough, accurate `project_overview.md` so all downstream roles have full context from day one.

## Step 1 — Detect Existing Projects

Run `tree /F` (Windows) or `find . -maxdepth 4 -not -path './ai_workspace/*' -not -path './.git/*'` (Linux/Mac). Identify project roots by:
- **Config/manifest files:** `package.json`, `Cargo.toml`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Gemfile`, `tsconfig.json`, etc.
- **Source directories:** `src/`, `lib/`, `app/`, `packages/`, `crates/`
- **Framework markers:** `.next/`, `node_modules/`, `venv/`, `target/`, `dist/`

Each config + source cluster = one project. Note relationships if multiple exist (monorepo, sibling services, etc.).

## Step 2 — Deep Analysis (Existing Projects)

For each detected project:
- **Read key configs:** manifests, language/toolchain configs, env files (`docker-compose.yml`, `Dockerfile`), CI/CD configs.
- **Map the source tree:** walk modules/packages, read entry points and public APIs, note inter-module dependencies, identify architecture patterns (MVC, layered, hexagonal, etc.).
- **Understand data layer:** DB schemas/migrations/ORM models, API contracts (OpenAPI, GraphQL), message queues, external integrations.
- **Review docs and tests:** existing READMEs, ADRs, test structure/coverage approach, known issues in code comments.

## Step 3 — Present Findings to User

Summarize: project inventory (name, language/framework, purpose), architecture overview (component interactions, data flow, deployment), key dependencies/integrations, and any gaps you couldn't determine from files alone. Ask the user to correct or expand. Iterate until confirmed accurate.

## Step 4 — Greenfield Interview (No Existing Projects)

If no project files detected outside `ai_workspace/`, interview from scratch:
- **Goals:** What are we building? Who uses it? Target platform(s)? Expected scale?
- **Technical direction:** Preferred language/framework? Single or multi-project? Hosting/deployment preferences?
- **Architecture decisions:** Data storage needs, auth requirements, external integrations, performance/latency constraints.
- **Non-functional:** Security, accessibility, i18n, observability (logging/metrics/tracing).

Iterate until the full picture is clear. Present a complete summary for user confirmation before proceeding.

## Step 4b — Generate `.gitignore`

After confirming the tech stack (Step 3 for existing projects, Step 4 for greenfield), ensure a `.gitignore` file exists at the project root.

**For existing projects:** Check if `.gitignore` already exists. If present, skip this step.

**For new or missing `.gitignore`:** Create one combining:
- **Global patterns (always include):**
  - OS files: `Thumbs.db`, `*.DS_Store`, `.nf_*`
  - IDE configs: `.vscode/`, `.idea/`, `*.swp`, `*.swo`
  - Environment files: `.env`, `.env.*`, `!.env.example`
- **Language/framework-specific patterns** based on detected or chosen stack. Reference [github/gitignore](https://github.com/github/gitignore) templates as the primary source:
  - Node.js → `node_modules/`, `npm-debug.log*` (if using npm), `yarn.lock` (if using Yarn), `dist/`, `build/`
  - Python → `__pycache__/`, `*.py[cod]`, `venv/`, `.venv/`, `*.egg-info/`, `.pytest_cache/`
  - Rust → `target/`, `Cargo.lock` (for libraries)
  - Go → `vendor/`, `*.exe`, `*.test`
  - Java/Kotlin → `*.class`, `*.jar`, `*.war`, `.gradle/`, `build/`, `target/`
  - Ruby → `.bundle/`, `vendor/bundle/`, `Gemfile.lock` (commit by default)
  - TypeScript → same as Node.js plus `.tsbuildinfo`

Keep the file concise — prefer referencing [github/gitignore](https://github.com/github/gitignore) for comprehensive templates rather than hardcoding exhaustive lists inline.

## Step 5 — Write `project_overview.md`

Create `ai_workspace/project_overview.md` following [`skill_helpers/project_overview_guide.md`](project_overview_guide.md) "Creating from Scratch" section.

## Step 6 — Propose Optional TODO Items

After confirming `project_overview.md`, analyze the project and propose **optional** improvement items grouped by category:
- **Stale/dead code:** unused files/modules, deprecated dependencies, backup files, references to removed features.
- **Anti-patterns/quality issues:** copy-paste logic, hardcoded values, missing error handling, deep nesting, inconsistent naming, missing type annotations.
- **Incomplete functionality:** TODO/FIXME comments, stubbed functions, partial implementations, skipped tests without tracking.
- **Suggested enhancements:** missing critical-path tests, observability gaps, security improvements, performance optimizations, DX improvements (hooks, linting, CI), a11y/i18n gaps.

For each item provide: **What** (brief description), **Where** (file/area affected), **Why it matters** (impact). Present as numbered list grouped by category. For accepted items, assign priority (`P0`–`P3`) and create `.md` files in `ai_workspace/TODO/` per [`skill_helpers/todo_guide.md`](todo_guide.md) using filename format `TODO_P{N}_{underscore_separated_name}.md`. Declined items are dropped — no record needed.

Once TODOs are captured (or user declines all), return control to the Interviewer for normal problem-scoping work.
