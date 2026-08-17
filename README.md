# AI Flow Test — Sequential Role Pipeline

Hey there! This is an experiment in getting AI coding agents to work through software tasks one step at a time, using a **sequential pipeline of 7 roles**. Each role has its own markdown "skill file" that tells the agent who it is and what to do. The master orchestrator (`AGENTS.md`) wires them all together.

The idea is simple: instead of asking an AI to just "do everything," you guide it through a structured process — interview, plan, build, test, document, review, then clean up. After that, the pipeline can loop back and start the next round of work. It's like having a tiny dev team inside your editor.

## What Is This?

This repo contains a complete AI agent workflow system built around **role-based skill files**. Here's how it works:

1. An AI assistant reads `AGENTS.md` to understand the pipeline rules.
2. It adopts one role at a time (Interviewer → Planner → Worker → Tester → Documenter → Reviewer → Finalizer).
3. Each role does its job, writes up a summary, and hands off to the next role.
4. After the Finalizer squashes everything into one commit, the pipeline can loop back for more work.

The whole thing runs inside [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent), but the core idea (AGENTS.md + role files) is portable to any AI agent system that supports custom instructions/skills.

## The 7 Roles at a Glance

| # | Role | What It Does |
|---|------|-------------|
| 01 | **Interviewer** | Figures out what you actually want — asks questions, scopes the work, checks for pending TODOs and external changes |
| 02 | **Planner** | Designs the architecture and writes a step-by-step implementation plan |
| 03 | **Worker** | Gets its hands dirty — writes code, creates files, runs commands |
| 04 | **Tester** | Checks everything works (type checks, edge cases, manual verification), reports bugs |
| 05 | **Documenter** | Writes READMEs, API docs, usage guides, and inline comments |
| 06 | **Reviewer** | Quality gate — audits scope, code quality, architecture, security, and `.gitignore` |
| 07 | **Finalizer** | Squashes all commits into one `[ai-pipeline]` commit, cleans up state files, updates project overview |

Each role has a "What You Must Not Do" section that keeps it in its lane — the Planner doesn't write code, the Worker doesn't review architecture, and so on.

## Getting Started

### Option A: Drop Into an Existing Project

1. Copy `AGENTS.md` plus these subdirectories into your project root:
   - `ai_workspace/roles/`
   - `ai_workspace/skill_helpers/`
2. *(Optional)* If using [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent), install it (`npm install -g @earendil-works/pi-coding-agent`) and run `pi` in your project root — the assistant will read `AGENTS.md` and start at the Interviewer role.
3. *(Non-pi users)* Any AI agent system that supports custom instructions can use this pipeline — just point it at `AGENTS.md`.

### Option B: Start From Scratch

1. Clone this repo (or copy the files above).
2. *(Optional)* If using [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent), install it (`npm install -g @earendil-works/pi-coding-agent`) and run `pi` — on first run, the Interviewer will detect there's no existing project and walk you through setup using the init guide built into its skill file.
3. *(Non-pi users)* Any AI agent system that supports custom instructions can use this pipeline — just point it at `AGENTS.md`.

### Optional: Auto-Pipeline Extension

If you're using pi, you can drop in the `.pi/extensions/pipeline-auto.ts` extension to run the whole pipeline autonomously (no manual role transitions). Just type `/pipeline-auto` and it handles everything — spawning sub-agents, auto-responding to prompts with recommended defaults, streaming output live. See the [Pipeline-Auto Extension](#pipeline-auto-extension) section below for details.

## ⚠️ Disclaimers & Warnings

### This Is Experimental
This system was built as a personal sandbox experiment. It works well enough for my own projects (including some commercial development), but it's not production-grade tooling. Use at your own discretion.

### Pi-Developed, But Core Ideas Are Portable
The skill files and orchestration logic were developed using [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent). The core pipeline concept (AGENTS.md + role markdown files) should work with any AI agent system that supports custom instructions or skills. Only the extension (`pipeline-auto.ts`) is pi-specific.

### Files You Shouldn't Copy Into Your Own Project

Some files in this repo are **project-specific state** or **runtime artifacts**. They're useful as reference, but don't copy them blindly:

| File | Why Not to Copy |
|------|----------------|
| `ai_workspace/project_overview.md` | Contains history specific to *this* project's previous loops. Your project will generate its own. |
| `ai_workspace/TODO/*` | Pending work items for *this* project only. Start fresh in your own repo. |
| `ai_workspace/loop_state.md` | Runtime state file — created at pipeline start, deleted by Finalizer. Don't commit this. |
| `.gitignore` | Tailored to this specific project's stack. It might be useful as a reference, but check it against your needs first. |

## Deeper Dive

### Pipeline-Auto Extension

The `.pi/extensions/pipeline-auto.ts` file is a pi extension that runs the role pipeline autonomously via sequential sub-agent sessions:

- **RPC mode** — Spawns `pi --mode rpc` subprocesses with JSONL communication on stdout/stdin
- **Live streaming** — Non-thinking text streams live via `message_update/text_delta` events, tool calls shown inline (🛠 name, ✅/❌ results). Consecutive blank lines in streamed output condense into a single `-` separator.
- **Auto-response** — Extension UI dialogs (`confirm`, `select`, `input`, `editor`) are auto-responded with recommended/default values
- **Context usage display:** Every streamed line shows a colored prefix like `[12.3k/128.0k (9.6%)]` with real-time token consumption per sub-agent session. Green (< 60%), yellow (60–85%), red (> 85%). Silently hidden when stats are unavailable.
- **Live steering input:** During a run, type plain text into the TUI to forward it directly to the active sub-agent (echoed as `🎯 Steering → <text>`).
- **Low-context wind-down:** Sessions near their context limit (e.g., < 15k tokens remaining) automatically receive an instruction to save their progress to `loop_state.md` and exit, allowing a fresh session to seamlessly pick up the work.
- **Safety features:** Max 50 sessions, infinite-loop detection (warns after 3+ consecutive same-role runs), `can_loop` guard (exits if Planner hasn't enabled it)

**Usage:** `/pipeline-auto` — start the pipeline | `/pipeline-auto --help` — show help text

### Configuration

Line 3 of `loop_state.md` carries global mutable key-value pairs that any role can update mid-pipeline:

| Key | Values | Description |
|-----|--------|-------------|
| `test_level` | `quick`, `deep`, `skip` | How thorough the Tester should be |
| `do_docs` | `true`, `false` | Whether to include the Documenter role |
| `can_loop` | `true`, `false` | Whether auto-looping is allowed (set by Planner) |

### Routing — Where Does Work Go Next?

The pipeline dynamically routes based on config. Here's how it works:

**Worker hands off to:**

| do_docs | test_level | Hands off to |
|---------|------------|--------------|
| true    | deep/quick | Tester → Documenter |
| true    | skip       | Documenter         |
| false   | deep/quick | Tester → Reviewer  |
| false   | skip       | Reviewer           |

**Tester hands off to:**

| do_docs | test_level | Hands off to |
|---------|------------|--------------|
| true    | deep/quick | Documenter (Role 05) |
| false   | deep/quick | Reviewer (Role 06)   |

### State Management

- **`loop_state.md`** — Single shared state file. Line 1 = goal summary, line 2 = current role + history, line 3 = pipeline config. Body contains each completed role's summary section.
- **Send-back loop** — Tester/Reviewer can route issues back to Worker via `(in-sendback)` suffix on line 2. Issues live inline under `### Send-Back Issues` subsections.
- **Git strategy** — Per-role incremental commits during the pipeline, squashed into one `[ai-pipeline]` commit by Finalizer at loop end.

### Second Opinion — Adversarial Auditor (Manual Role)

Second Opinion is a manual role loaded outside the normal 01→07 pipeline. It provides an adversarial review of the current loop's work — plans, designs, decisions — looking for issues the original LLM may have missed due to confirmation bias.

**Trigger:** Start a session with "Load second opinion" in your initial message (case-insensitive).

**Optional focus targeting:** Add a focus phrase after the trigger, e.g., "Load second opinion, focus on planning" or "Load second opinion, review testing."

**What it reviews:** Design/architecture, implementation quality, testing coverage, documentation gaps, security concerns, and performance issues.

**Severity tiers:**
- **Critical** — Bugs, vulnerabilities, or design flaws that will cause failures.
- **Important** — Significant quality issues or missing functionality creating technical debt.
- **Cosmetic** — Style inconsistencies and minor improvements.

**How it works:** Second Opinion presents findings to you organized by severity. You choose which items to log (only approved items are saved) — logged findings become **directives for the affected roles**, each of which must acknowledge its assigned finding(s) in-session as fixed, deferred, or rejected (rejections require reasoning). It can trigger a single send-back to the earliest affected role, but only with your approval.

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
│   ├── 07_finalizer.md               ← Squash commits, reset for next loop
│   └── manual_second_opinion.md      ← Adversarial auditor (manual trigger)
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

## Key Design Decisions

- **Role separation** enforced via "What You Must Not Do" sections in each skill file
- **Single shared state** (`loop_state.md`) replaces per-role completion files
- **Inline progress tracking** with checkbox subsections — no external `_in_progress.md` files
- **Goal summary on line 1** of `loop_state.md` used by all roles for git commit messages
- **Out-of-scope requests** captured as individual TODO files in `ai_workspace/TODO/`
- **Token optimization** across instruction files (~36% reduction from consolidation)
- **Mid-loop cancellation** supported via two-step confirmation (Roles 01–06)

## Changelog

### 2026-08-16 — Deep Testing: Bug Fixes and Comprehensive Unit Test Suite

- **Fixed** double-reporting of error tools in `flushAllBufferedText()` (`pipeline-auto.ts`) — errors were already printed at `toolcall_end`; removed redundant fallback reporting loop.
- **Added** `test_unit_deep.js` — 59 new unit tests covering previously untested areas:
  - `parseLoopState()` unified parsing (standard, send-back, minimal, empty, malformed content) — 19 tests
  - `autoRespondUiRequest()` logic for all UI dialog types — 10 tests
  - `loopStateExists()` edge cases via filesystem operations — 4 tests
  - Infinite loop detection (`STUCK_THRESHOLD`) with normal progression, stuck, and alternating patterns — 7 tests
  - Event listener registration verification (session_start, turn_end, agent_end, session_shutdown, input) — 6 tests
  - Extension source code static analysis (constants, AUTO_ACCEPT_INSTRUCTIONS directives, TypeScript types) — 8 tests
  - `parseLoopState()` with `<br>` tag variations — 5 tests
- **Fixed** test assertion bugs in `test_toolcall_streaming.js`: wrong emoji (`🛠` → `🧰`), incorrect truncation length regex (18 → 20 chars), and wind-down conflict in T7.
- **Total test count:** 144 tests across 4 suites, all passing.

### 2026-08-16 — Pipeline-Auto: Blank-Line Condensation, Live Steering, Low-Context Wind-Down

- **Added** live steering input: users can type plain text into the TUI during a run to steer the active sub-agent session without interrupting it.
- **Added** low-context wind-down: active sessions near their context limit automatically save their state and exit, allowing a fresh session to continue the work.
- **Added** blank-line condensation: consecutive blank lines in streamed sub-agent text now collapse into a single `-` separator line to reduce vertical clutter.

### 2026-08-15 — Second Opinion Actionable Findings Mandate

- **Modified** `ai_workspace/roles/manual_second_opinion.md` Step 5 template — logged findings are now directives, not optional context. Template is self-contained: downstream roles understand their obligation without loading the skill file.
- **Added** mandatory `### Required Action — Affected Roles` block to every logged section — per-role callouts generated from the Target Role column (e.g., "Worker (Role 03): you must address Finding #1") plus acknowledgment rules: only directly-affected roles respond; each MUST state in-session whether it fixed, deferred, or rejected each assigned finding; rejections are invalid without reasoning.
- **Updated** Deliverables section — item 2 now references the directive block; new item 3 tracks acknowledgment (in-session response, no persistent audit trail).
- **Deleted** `ai_workspace/TODO/TODO_P2_second_opinion_forceful_summary.md` — this loop addressed that item.
- **Updated** this README's Second Opinion section to document the actionable-findings behavior.

### 2026-07-XX — Second Opinion Adversarial Auditor Role

- **Added** `ai_workspace/roles/manual_second_opinion.md` — new manual role for adversarial review of pipeline work. Triggered by "Load second opinion" at session start (case-insensitive), sits outside the normal 01→07 pipeline.
- **Added** optional focus targeting — e.g., "Load second opinion, focus on planning" to emphasize specific dimensions while still reviewing everything.
- **Modified** `AGENTS.md` Session Startup — inserted Step 0 for trigger phrase detection before normal role loading (steps 1–10 skipped when triggered).
- **Updated** this README with Second Opinion documentation in Deeper Dive section and file structure table.

### 2026-07-27 — Context Usage Display for Pipeline-Auto Extension

- **Added** real-time context usage prefix to every streamed console line in `pipeline-auto.ts`. Format: `[N.Nk/T.Tk (P.P%)]` with one decimal for percentage.
- **Added** color-coded display using ANSI codes: green (< 60%), yellow (60–85%), red (> 85%).
- **Polling strategy:** Opportunistic `get_session_stats` RPC call on every buffer flush (newline event) — no timers, fresh data per line.
- **Graceful degradation:** Prefix silently omitted when `contextUsage` is null/missing (e.g., post-compaction) or RPC fails. Extension continues normally.
- **Compaction handling:** Stats reset to empty after compaction until fresh response arrives.

### 2026-07-23 — README Rewrite + Interviewer/Planner Summary Enhancements

- **Rewrote** `README.md` with casual/approachable tone. Reordered sections for natural flow: What it is → Pipeline overview (7 roles) → Getting Started → Disclaimers & Warnings → Deeper Dive.
- **Added** "Disclaimers & Warnings" section covering experimental nature, Pi-specific vs portable components, and a "Files Not to Copy" table (`project_overview.md`, `TODO/*`, `loop_state.md`, `.gitignore`).
- **Enhanced** `ai_workspace/roles/01_interviewer.md` Deliverables — now mandates richer loop_state summaries: success criteria, integration points, background/motivation, user-facing behavior changes, and file/code references.
- **Enhanced** `ai_workspace/roles/02_planner.md` Deliverables — now mandates richer loop_state summaries: design rationale (why), expected outcomes per step, testing strategy overview, dependencies/rollback considerations, and project conventions/patterns.

### 2026-07-21 — pipeline-push → pipeline-auto RPC Refactor

- **Renamed** `.pi/extensions/pipeline-push.ts` to `pipeline-auto.ts`, command changed from `/pipeline-push` to `/pipeline-auto`
- **Architecture shift:** From synchronous `spawnSync` (print mode `-p`) to async `spawn` with RPC mode (`--mode rpc`)
- **JSONL communication:** Sub-agents now communicate via JSONL on stdout instead of inherited stdio
- **Live streaming:** Non-thinking text streams live via `message_update/text_delta` events; tool calls shown inline (🛠 name, ✅/❌ results); compaction events displayed
- **Auto-response:** New `autoRespondUiRequest()` auto-responds to extension UI dialogs with recommended/default values
- **Line-buffered output:** Replaced raw streaming with line-buffered approach (`textBuffer` + `flushBufferedLines()`) to fix terminal checklist rendering where checkmarks appeared on separate lines from labels
- **Better TypeScript typing** in event handler callbacks via explicit type guards
- **Core loop logic preserved:** Stuck detection, can_loop guard, session limits all intact
