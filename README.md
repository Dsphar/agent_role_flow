# AI Flow Test — Sequential Role Pipeline

An AI agent workflow system that runs a **sequential pipeline of 7 roles** through structured markdown skill files, orchestrated by `AGENTS.md`. Each role adopts a specific persona (Interviewer, Planner, Worker, Tester, Documenter, Reviewer, Finalizer), completes its tasks, and transitions to the next. The pipeline loops across project lifecycles — each iteration can scope work, plan it, build it, test it, document it, review it, then squash and reset for the next loop.

## Quick Start

1. **Clone** this repository.
2. Ensure [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) is installed (`npm install -g @earendil-works/pi-coding-agent`).
3. Run `pi` in the project root. The assistant will read `AGENTS.md` and begin at the Interviewer role (or resume from `loop_state.md` if a pipeline is mid-flight).

## Architecture

### Pipeline Roles

| # | Role | Purpose |
|---|------|---------|
| 01 | **Interviewer** | Discovery, scoping, external change detection, TODO validation |
| 02 | **Planner** | Architecture design and implementation planning |
| 03 | **Worker** | Code execution — writes implementations, fixes send-back bugs |
| 04 | **Tester** | Testing (manual verification, type checks, edge cases), bug reporting |
| 05 | **Documenter** | READMEs, API docs, usage guides, changelogs, inline code comments |
| 06 | **Reviewer** | Quality gate — scope audit, code quality, architecture, security, `.gitignore` |
| 07 | **Finalizer** | Squash commits into one `[ai-pipeline]` commit, delete `loop_state.md`, update project overview |

### State Management

- **`loop_state.md`** — Single shared state file. Line 1 = goal summary, line 2 = current role + history, line 3 = pipeline config (`test_level`, `skip_docs`, `can_loop`). Body contains each completed role's summary section.
- **Send-back loop** — Tester/Reviewer can route issues back to Worker via `(in-sendback)` suffix on line 2. Issues live inline under `### Send-Back Issues` subsections.
- **Git strategy** — Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit by Finalizer at loop end.

### Pipeline-Auto Extension (`.pi/extensions/pipeline-auto.ts`)

A pi extension that runs the role pipeline autonomously via sequential sub-agent sessions:

- **RPC mode** — Spawns `pi --mode rpc` subprocesses with JSONL communication on stdout/stdin
- **Live streaming** — Non-thinking text streams live via `message_update/text_delta` events, tool calls shown inline (🛠 name, ✅/❌ results)
- **Auto-response** — Extension UI dialogs (`confirm`, `select`, `input`, `editor`) are auto-responded with recommended/default values
- **Safety features:** Max 50 sessions, infinite-loop detection (warns after 3+ consecutive same-role runs), `can_loop` guard (exits if Planner hasn't enabled it)

**Usage:** `/pipeline-auto` — start the pipeline | `/pipeline-auto --help` — show help text

### Configuration

Line 3 of `loop_state.md` carries global mutable key-value pairs:

| Key | Values | Description |
|-----|--------|-------------|
| `test_level` | `quick`, `deep`, `skip` | How thorough the Tester should be |
| `skip_docs` | `true`, `false` | Whether to skip the Documenter role entirely |
| `can_loop` | `true`, `false` | Whether auto-looping is allowed (set by Planner) |

### Routing Matrices

**Worker handoff targets:**

| skip_docs | test_level | Hands off to |
|-----------|------------|--------------|
| false     | deep/quick | Tester → Documenter |
| false     | skip       | Documenter         |
| true      | deep/quick | Tester → Reviewer  |
| true      | skip       | Reviewer           |

**Tester handoff targets:**

| skip_docs | test_level | Hands off to |
|-----------|------------|--------------|
| false     | deep/quick | Documenter (Role 05) |
| true      | deep/quick | Reviewer (Role 06)   |

## File Structure

```
AGENTS.md                              ← Master workflow orchestrator
README.md                              ← This file
ai_workspace/
├── roles/                             ← Role skill files (01–07)
│   ├── 01_interviewer.md              ← Discovery & scoping
│   ├── 02_planner.md                  ← Architecture & implementation plan
│   ├── 03_worker.md                   ← Code execution
│   ├── 04_tester.md                   ← Testing (unit + e2e)
│   ├── 05_documenter.md              ← Documentation
│   ├── 06_reviewer.md                ← Quality gate review
│   └── 07_finalizer.md               ← Squash commits, reset for next loop
├── skill_helpers/                     ← Shared workflow guides
│   ├── cancel_guide.md                ← Mid-loop cancellation flow
│   ├── external_changes_guide.md      ← Detecting human-made changes
│   ├── init_project_guide.md          ← Greenfield onboarding
│   ├── project_overview_guide.md      ← Spec for project_overview.md
│   ├── sendback_guide.md              ← Bug routing back to Worker
│   ├── todo_guide.md                  ← Out-of-scope item capture
│   └── transition_guide.md            ← Role completion & git commit rules
├── TODO/                              ← Pending items (one .md per item)
├── loop_state.md                      ← Runtime state (created at pipeline start, deleted by Finalizer)
└── project_overview.md                ← Project history across loops
.pi/extensions/
└── pipeline-auto.ts                   ← Auto-pipeline runner extension (RPC mode)
```

## Tech Stack

- **Language:** Markdown (skill files, orchestration), TypeScript (pi extensions)
- **Framework:** [pi coding agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) ExtensionAPI
- **Version Control:** Git (per-role incremental commits, squashed by Finalizer)

## Key Design Decisions

- **Role separation** enforced via "What You Must Not Do" sections in each skill file
- **Single shared state** (`loop_state.md`) replaces per-role completion files
- **Inline progress tracking** with checkbox subsections — no external `_in_progress.md` files
- **Goal summary on line 1** of `loop_state.md` used by all roles for git commit messages
- **Out-of-scope requests** captured as individual TODO files in `ai_workspace/TODO/`
- **Token optimization** across instruction files (~36% reduction from consolidation)
- **Mid-loop cancellation** supported via two-step confirmation (Roles 01–06)

## Changelog

### 2026-07-21 — pipeline-push → pipeline-auto RPC Refactor

- **Renamed** `.pi/extensions/pipeline-push.ts` to `pipeline-auto.ts`, command changed from `/pipeline-push` to `/pipeline-auto`
- **Architecture shift:** From synchronous `spawnSync` (print mode `-p`) to async `spawn` with RPC mode (`--mode rpc`)
- **JSONL communication:** Sub-agents now communicate via JSONL on stdout instead of inherited stdio
- **Live streaming:** Non-thinking text streams live via `message_update/text_delta` events; tool calls shown inline (🛠 name, ✅/❌ results); compaction events displayed
- **Auto-response:** New `autoRespondUiRequest()` auto-responds to extension UI dialogs with recommended/default values
- **Line-buffered output:** Replaced raw streaming with line-buffered approach (`textBuffer` + `flushBufferedLines()`) to fix terminal checklist rendering where checkmarks appeared on separate lines from labels
- **Better TypeScript typing** in event handler callbacks via explicit type guards
- **Core loop logic preserved:** Stuck detection, can_loop guard, session limits all intact
