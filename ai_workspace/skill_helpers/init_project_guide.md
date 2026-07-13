# Project Initializer Guide

Loaded by the Interviewer when `project_context.md` does not yet exist. Your job is to build a thorough, accurate `project_context.md` so all downstream roles have full context from day one.

## Step 1 — Detect Existing Projects

Run `tree /F` (Windows) or `find . -maxdepth 4 -not -path './ai_workspace/*' -not -path './.git/*'` (Linux/Mac) to map the workspace outside of `ai_workspace/`. Look for project roots by identifying:

- **Config/manifest files:** `package.json`, `Cargo.toml`, `pyproject.toml`, `requirements.txt`, `setup.py`, `pom.xml`, `build.gradle`, `go.mod`, `Gemfile`, `mix.exs`, `CMakeLists.txt`, `Makefile`, `tsconfig.json`, `deno.json`
- **Source directories:** `src/`, `lib/`, `app/`, `packages/`, `crates/`, `internal/`, `cmd/`
- **Framework markers:** `.next/`, `.svelte-kit/`, `node_modules/`, `venv/`, `target/`, `dist/`, `build/`

Each cluster of config + source = one project. If multiple projects exist, note how they relate (monorepo, sibling services, frontend/backend split).

## Step 2 — Deep Analysis (Existing Projects)

For each detected project:

### 2a — Read Key Configuration
- Main manifest/config file(s) — dependencies, scripts, entry points, build targets
- Language/toolchain configs (`tsconfig.json`, `.eslintrc`, `rust-toolchain`, etc.)
- Environment files (`.env.example`, `docker-compose.yml`, `Dockerfile`)
- CI/CD configs (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`)

### 2b — Map the Source Tree
Walk through source directories. For each module/package:
- Read key files (entry points, main modules, public API surfaces)
- Note dependencies between modules (imports, references)
- Identify architecture patterns (MVC, layered, hexagonal, microservices, etc.)

### 2c — Understand the Data Layer
- Database schemas, migrations, ORM models
- API contracts (OpenAPI/Swagger specs, GraphQL schemas)
- Message queues, event streams, external service integrations

### 2d — Review Documentation and Tests
- Existing `README.md`, docs folders, architecture decision records
- Test structure and coverage approach
- Known issues or TODOs in code comments

## Step 3 — Present Findings to User

Summarize what you found:
- **Project inventory:** Name each project, its language/framework, purpose
- **Architecture overview:** How components fit together, data flow, deployment model
- **Key dependencies and integrations**
- **Gaps or ambiguities** you couldn't determine from files alone

Ask the user to correct, clarify, or expand anything. Iterate until they confirm the picture is accurate.

## Step 4 — Greenfield Interview (No Existing Projects)

If no project files were detected outside `ai_workspace/`, interview the user from scratch:

### 4a — High-Level Goals
- What are we building? Who uses it? What problem does it solve?
- Target platform(s): web, mobile, desktop, CLI, API service, all of the above?
- Expected scale: personal tool, team use, public-facing product?

### 4b — Technical Direction
- Preferred language(s) and framework(s)? If unsure, suggest options based on goals.
- Project structure: single project or multi-repo/monorepo?
- Hosting/deployment preferences (cloud provider, self-hosted, serverless, etc.)

### 4c — Architecture Decisions
- Data storage needs (relational DB, document store, file-based, none yet)
- Authentication/authorization requirements
- External integrations (APIs, payment processors, third-party services)
- Performance or latency constraints

### 4d — Non-Functional Requirements
- Security considerations
- Accessibility targets
- Internationalization needs
- Observability (logging, metrics, tracing)

Iterate with follow-up questions until the full picture is clear. Present a complete summary for user confirmation before proceeding.

## Step 5 — Write `project_context.md`

Create `ai_workspace/project_context.md` following [`skill_helpers/project_context_guide.md`](project_context_guide.md). Use the "Creating from Scratch" section of that guide for the template and field definitions.

## Step 6 — Propose Optional TODO Items

After confirming `project_context.md` is accurate, analyze the project and propose a list of **optional** improvement items to the user. These are suggestions — the user picks what they want (if anything). Categories to consider:

### Stale or Dead Code
- Unused files, modules, or imports detected during source mapping
- Deprecated dependencies in manifests that no longer appear in code
- Old build artifacts, backup files (`*.bak`, `*~`), or legacy config variants
- References to removed features (dead routes, orphaned API endpoints)

### Anti-Patterns and Code Quality Issues
- Repetitive copy-paste logic that should be extracted into shared utilities
- Hardcoded values (API keys, URLs, paths) that belong in environment config
- Missing error handling or overly broad `try/catch` blocks
- Deeply nested conditionals or functions exceeding reasonable length
- Inconsistent naming conventions across modules
- Missing type annotations or unchecked dynamic behavior in typed languages

### Incomplete Functionality
- TODO/FIXME/HACK comments left in source code
- Stubbed-out functions, placeholder routes, or `notImplemented` handlers
- Partially implemented features (e.g., a UI component wired to no backend)
- Tests marked as skipped (`xit`, `test.skip`, `@pytest.mark.skip`) with no tracking issue
- Incomplete documentation for public APIs or modules

### Suggested Enhancements
- Missing tests for critical paths identified during source mapping
- Logging, metrics, or observability gaps in production-facing code
- Security improvements (input validation, auth checks, rate limiting)
- Performance optimizations (N+1 queries, missing indexes, unbatched calls)
- Developer experience improvements (pre-commit hooks, linting config, CI checks)
- Accessibility or internationalization gaps if the project is user-facing

Present these as a numbered list grouped by category. For each item, provide:
- **What:** Brief description of the issue or opportunity.
- **Where:** File(s) or area affected (if specific).
- **Why it matters:** Impact on quality, maintainability, security, or user experience.

Ask the user which items they want to pursue. For each item they accept, create a corresponding `.md` file in `ai_workspace/TODO/` following [`skill_helpers/todo_guide.md`](todo_guide.md). Items they decline are simply dropped — no record needed.

Once TODO items are captured (or the user declines all), delete this guide's temporary notes (if any) and return control to the Interviewer for normal problem-scoping work.
