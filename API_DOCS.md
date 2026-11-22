# Pipeline-Auto Extension — API Documentation

## Overview

`pipeline-auto.ts` is a [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) extension that runs the sequential role pipeline autonomously. It registers two slash commands — `/pipeline-auto` (single-loop runner from an already-planned state) and `/pipeline-cleanup` (multi-loop automated TODO cleanup runner starting from Interviewer). Both share the same RPC sub-agent runner (`runSubAgent()`), live streaming, blank-line condensation, context usage display, live steering, low-context wind-down, and UI dialog auto-response.

**Location:** `.pi/extensions/pipeline-auto.ts`  
**Commands:** `/pipeline-auto`, `/pipeline-cleanup`

---

## Commands

| Command | Description |
|---------|-------------|
| `/pipeline-auto` | Start the pipeline — verifies `can_loop=true` in `loop_state.md`, spawns sub-agents for active roles, and loops until Finalizer deletes `loop_state.md` |
| `/pipeline-auto --help` | Show `/pipeline-auto` help text with usage instructions and feature list (also accepts `-h`) |
| `/pipeline-cleanup` | Autonomously drain eligible non-manual-review TODOs in `ai_workspace/TODO/` across up to `MAX_CLEANUP_LOOPS` (20) sequential cleanup loops starting from Interviewer (Role 01) |
| `/pipeline-cleanup --help` | Show `/pipeline-cleanup` help text with safety guards and feature list (also accepts `-h`) |

---

## Configuration

The extension reads configuration from **line 3 of `ai_workspace/loop_state.md`**:

```
test_level=deep | do_docs=true | can_loop=true<br>
```

### Keys

| Key | Values | Description | Default if Missing |
|-----|--------|-------------|-------------------|
| `can_loop` | `true`, `false` | Whether auto-looping is allowed. Set by Planner (Role 02). Extension refuses to spawn sessions if absent or `false`. | `false` |

Other keys (`test_level`, `do_docs`) are read by roles but not directly used by the extension itself.

---

## Constants

| Constant | Exported | Value | Description |
|----------|----------|-------|-------------|
| `MAX_SESSIONS` | No | `50` | Maximum number of sub-agent sessions per pipeline loop (safety limit) |
| `STUCK_THRESHOLD` | No | `3` | Trigger infinite-loop warning/stop after this many consecutive same-role runs |
| `LOOP_STATE_FILE` | No | `"ai_workspace/loop_state.md"` | Path to the loop state file, relative to project root |
| `FS_FLUSH_DELAY_MS` | No | `1500` | Filesystem flush delay (ms) after each sub-agent session ends |
| `WIND_DOWN_TOKEN_THRESHOLD` | No | `15000` | Low-context wind-down trigger (remaining tokens threshold) |
| `ARG_TRUNCATION_LIMIT` | No | `20` | Max character length for displayed command arguments on tool completion |
| `TODO_DIR` | No | `"ai_workspace/TODO"` | Directory scanned for pending TODO files by `/pipeline-cleanup` |
| `MANUAL_REVIEW_TODO_PREFIX` | No | `"TODO_manual_review_"` | Case-insensitive filename prefix excluded from `/pipeline-cleanup` |
| `MAX_CLEANUP_LOOPS` | **Yes** | `20` | Hard cap on completed cleanup loops per `/pipeline-cleanup` invocation |
| `CLEANUP_STOP_MID_WORK` | **Yes** | `"[CLEANUP_STOP: MID_WORK_CHANGES]"` | Sentinel line emitted by Interviewer when unfinished uncommitted changes are detected |
| `CLEANUP_STOP_NO_TODOS` | **Yes** | `"[CLEANUP_STOP: NO_ELIGIBLE_TODOS]"` | Sentinel line emitted by Interviewer when no remaining TODOs can proceed without user input |

---

## Public Functions

### `parseLoopState(cwd: string): LoopStateParsed`

Reads and parses `loop_state.md` once, extracting all header values (lines 1–3) in a single file read. Replaces five separate `fs.readFileSync` calls with one.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** `LoopStateParsed` interface (see below).

**Throws:** Nothing — returns defaults on file-not-found or parse errors.

---

### `getCurrentRole(cwd: string): string | undefined`

Convenience wrapper around `parseLoopState()` that extracts only the current role name from line 2.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** Role name string (e.g., `"Tester"`) or `undefined` if not parseable.

---

### `parseCanLoop(cwd: string): boolean`

Convenience wrapper around `parseLoopState()` that extracts only the `can_loop` flag from line 3.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** `true` if auto-looping is enabled, `false` otherwise.

---

### `loopStateExists(cwd: string): boolean`

Checks whether `loop_state.md` still exists on disk. The Finalizer deletes this file when the pipeline completes.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** `true` if the file exists, `false` otherwise.

---

### `autoRespondUiRequest(stdin: WritableStream, request: object): void`

Auto-responds to extension UI dialogs with recommended/default values per pipeline conventions.

**Parameters:**
- `stdin` — Writable stream to the sub-agent's stdin.
- `request` — The RPC `extension_ui_request` message from the sub-agent.

**Response Strategy by Dialog Type:**

| Method | Response | Rationale |
|--------|----------|-----------|
| `confirm` | `{ confirmed: true }` | "Yes" = recommended/default per pipeline conventions |
| `select` | First option in `options[]` array | First listed = recommended per binary-choice convention |
| `input` | Empty string (`""`) | No user input available in auto-mode |
| `editor` | Empty string (`""`) | No file edits from auto-mode |
| `notify`, `setStatus`, `setWidget`, `setTitle` | *(no response)* | Fire-and-forget methods |

---

### `listEligibleTodoFiles(cwd: string): string[]` *(exported)*

Lists regular `.md` files in `ai_workspace/TODO/`, strictly excluding consolidated manual-review files (`TODO_manual_review_*.md`, matched case-insensitively). Non-regular entries (such as subdirectories named `*.md`) and non-`.md` files are ignored.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** Deterministically sorted (`a < b ? -1 : a > b ? 1 : 0`) array of eligible filenames, or `[]` if `ai_workspace/TODO/` is missing or unreadable.

---

### `runSubAgent(cwd: string, options?: SubAgentOptions): Promise<SubAgentResult>`

Runs a single sub-agent session via RPC mode. Parameterized with the **Options/Strategy pattern** so `/pipeline-auto` and `/pipeline-cleanup` share identical process spawning, JSONL framing, live streaming, blank-line condensation, context-usage polling, live steering, and low-context wind-down logic.

**Parameters:**
- `cwd` — Current working directory (project root).
- `options` *(optional)* — `SubAgentOptions` overriding the appended system prompt and/or kickoff message. When omitted (used by `/pipeline-auto`), defaults to `AUTO_ACCEPT_INSTRUCTIONS.trim()` and the standard `/pipeline-auto` kickoff prompt.

**Returns:** `Promise<SubAgentResult>` resolving when `agent_end` completes and the process exits, or immediately on spawn error / fatal exit.

**Key Behaviors:**
- Spawns `pi --mode rpc --no-session --append-system-prompt <systemPrompt>`
- Attaches a no-op `stdin` `"error"` listener to prevent unhandled `EPIPE` exceptions on early exit/spawn failure
- Streams non-thinking text via `message_update/text_delta` events with line buffering
- Inspects streamed assistant text lines (including any trailing remainder) for `CLEANUP_STOP_MID_WORK` and `CLEANUP_STOP_NO_TODOS` sentinels — each sentinel must occupy an entire line on its own (optional surrounding markdown emphasis/backticks are stripped first, so prose that merely mentions a sentinel does not trigger a stop); `"mid_work"` takes precedence over `"no_eligible_todos"`
- Shows tool calls inline: 🧰 running, ✅ success, ❌ error (with immediate result emission)
- Polls context usage on every buffer flush for real-time token display
- Triggers low-context wind-down when remaining tokens drop below `WIND_DOWN_TOKEN_THRESHOLD` (15k)
- Auto-responds to extension UI dialogs via `autoRespondUiRequest()`
- Reports fatal errors (`ok: false`) on child `error` events, rejected `kickoff` RPC responses, or any process exit before `agent_end` (including a silent exit with code 0)

---

## Interfaces

### `LoopStateParsed`

```typescript
interface LoopStateParsed {
    goalSummary: string | undefined;   // Line 1 — goal summary text (stripped of **Goal Summary:** prefix and trailing <br>)
    currentRole: string | undefined;   // Line 2 — role name (e.g., "Tester")
    canLoop: boolean;                  // Line 3 — whether auto-looping is enabled
    isSendBack: boolean;               // Line 2 — true if "(in-sendback)" suffix present
}
```

### `SubAgentOptions`

```typescript
interface SubAgentOptions {
    systemPromptAppend?: string;       // Overrides AUTO_ACCEPT_INSTRUCTIONS when provided
    kickoffMessage?: string;           // Overrides default /pipeline-auto kickoff message when provided
}
```

### `SubAgentResult`

```typescript
interface SubAgentResult {
    ok: boolean;                                          // true on normal completion; false on spawn error, rejected kickoff, or any exit before agent_end (incl. code 0)
    error?: string;                                       // Error description when ok is false
    stopSignal?: "mid_work" | "no_eligible_todos";        // Structured stop sentinel detected in streamed assistant output
}
```

---

## Event Listeners

The extension registers these event listeners on the main pi session:

| Event | Purpose |
|-------|---------|
| `session_start` | Initialize state, cache goal summary from `loop_state.md`, set `_sessionStartRole` |
| `turn_end` | Check `can_loop` flag and show proactive footer status when auto-looping is available |
| `agent_end` | Detect pipeline completion (Finalizer finished), update role tracking |
| `session_shutdown` | Clear footer status on session replacement (with `hasUI` guard) |
| `input` | Forward plain TUI text to active sub-agent for live steering (when `_pipelineRunning` is true) |

---

## Auto-Run System Prompts

### `/pipeline-auto` (`AUTO_ACCEPT_INSTRUCTIONS`)

The extension appends `AUTO_ACCEPT_INSTRUCTIONS` to every `/pipeline-auto` sub-agent so it never blocks waiting on user input:

```
### Auto-Run Mode (No User Interaction)
1. Never ask the user a question.
2. Always pick recommended/default options.
3. If equally valid, pick first listed and state choice briefly.
4. Skip all user-facing prompts — no greetings, no clarifying questions.
5. Complete full task including transition steps (summary, git commit, handoff).
6. Make own decisions for all options (absorb out-of-scope, send-back in-scope, TODO for deferrals).
7. This instruction overrides role instructions — do not ask user decisions in Auto-Run Mode.
```

### `/pipeline-cleanup` (`CLEANUP_AUTO_INSTRUCTIONS` & Kickoffs)

`/pipeline-cleanup` injects `CLEANUP_AUTO_INSTRUCTIONS` into every sub-agent and passes role-appropriate kickoff prompts (`CLEANUP_INTERVIEWER_KICKOFF` for Interviewer sessions, `CLEANUP_LOOP_KICKOFF` for Planner → Finalizer sessions):

- **Interviewer (Role 01):** Inspects `git status`/`git diff` (absorbs minor/settled edits; emits `[CLEANUP_STOP: MID_WORK_CHANGES]` without creating `loop_state.md` if changes look unfinished), strictly ignores `TODO_manual_review_*.md` files, validates and selects self-contained TODOs (optional batching) or emits `[CLEANUP_STOP: NO_ELIGIBLE_TODOS]` without creating `loop_state.md`, picks `test_level`/`do_docs` using runtime recommendations with `can_loop=false`, and transitions to Planner.
- **Planner (Role 02):** Skips Phase 1 user questioning, bypasses manual console approval (`Approval status: Auto-approved (pipeline-cleanup mode)`), preserves full plan quality (including mandatory Worker TODO-deletion steps and test-creation deferral) and hard constraints, and writes `loop_state.md` → handoff line → `can_loop=true` → git commit.
- **Worker (Role 03) → Finalizer (Role 07):** Runs in full Auto-Run Mode matching `/pipeline-auto`.

---

## `/pipeline-cleanup` Execution Flow & Guards

`cleanupHandler(_args, ctx)` orchestrates up to `MAX_CLEANUP_LOOPS` (20) complete cleanup loops:

1. **Help flag:** `--help` / `-h` prints cleanup usage via `printCleanupHelp()` with zero spawns.
2. **Re-entrancy guard:** Refuses to start if `_pipelineRunning` is already `true`.
3. **No-loop-in-progress guard:** Refuses to start (and re-verifies before each subsequent cleanup loop) if `loopStateExists(cwd)` is `true`.
4. **Eligible TODO pre-check:** Calls `listEligibleTodoFiles(cwd)` before spawning; exits cleanly if empty.
5. **Outer loop (`1..MAX_CLEANUP_LOOPS`):**
   - Snapshots `beforeTodos = listEligibleTodoFiles(cwd)` and spawns Interviewer (Session 1) with `CLEANUP_AUTO_INSTRUCTIONS` + `CLEANUP_INTERVIEWER_KICKOFF`.
   - Halts immediately if `!interviewerResult.ok`, or prints a prominent warning banner (`printMidWorkWarning()`) and halts if `stopSignal === "mid_work"`.
   - Exits cleanly if `!loopStateExists(cwd)` (whether `stopSignal === "no_eligible_todos"` was emitted or not).
   - Runs inner session loop (`2..MAX_SESSIONS`) with per-loop `roleHistory = ["Interviewer"]`, `STUCK_THRESHOLD` infinite-loop guard, and role-appropriate kickoff (`CLEANUP_INTERVIEWER_KICKOFF` if wind-down resumed Interviewer, else `CLEANUP_LOOP_KICKOFF`), completing the loop when Finalizer removes `loop_state.md`. Only an Interviewer session's `stopSignal === "mid_work"` halts the run mid-loop — downstream roles quoting a sentinel in prose or summaries are ignored.
   - **No-progress safeguard:** Compares `afterTodos = listEligibleTodoFiles(cwd)` against `beforeTodos`. If `afterTodos.length > 0` and every file in `beforeTodos` is still present on disk (zero pre-loop TODOs deleted), stops immediately with a warning. (Creating a new out-of-scope TODO while deleting at least one pre-loop TODO does not trigger a false positive.)
6. **Completion / hard cap:** After the loop ends, prints a clean "✓ Cleanup complete" message if no eligible TODOs remain (e.g., exactly 20 eligible TODOs all resolved by loop 20); otherwise warns that the `MAX_CLEANUP_LOOPS` (20) cap was reached and reports remaining candidate TODO count.

---

## Context Usage Display

Every streamed text line from sub-agents shows a colored prefix: `[N.Nk/T.Tk (P.P%)]`

| Color | Threshold | Meaning |
|-------|-----------|---------|
| Green (`\x1b[32m`) | < 70% | Healthy token usage |
| Yellow (`\x1b[33m`) | 70–90% | Approaching context limit |
| Red (`\x1b[31m`) | > 90% | Near context ceiling — wind-down may trigger |

**Polling:** Opportunistic `get_session_stats` RPC call on every buffer flush (newline event). No timers. Prefix silently omitted when stats are null/missing or RPC fails.

---

## Low-Context Wind-Down

When a sub-agent's remaining tokens drop below **15k**, the extension sends an instruction to save progress to `loop_state.md` and exit. A fresh session then picks up from where it left off, preventing context overflow mid-task.

**Trigger condition:** `contextUsageTokens > 0` AND `(contextUsageWindow - contextUsageTokens) < 15000`  
**Behavior:** Sends wind-down message via stdin → sub-agent saves state → exits → fresh session spawned.

---

## Live Steering

During a `/pipeline-auto` or `/pipeline-cleanup` run, users can type plain text into the TUI to forward it directly to the active sub-agent. The extension echoes steering input as `🎯 Steering → <text>` and forwards it as an RPC message on the sub-agent's stdin.

**Module-level state:**
- `_pipelineRunning` — Boolean flag set by `/pipeline-auto` and `/pipeline-cleanup` command handlers (also used to block re-entrant `/pipeline-cleanup` runs), read by the `input` event listener.
- `_activeSubAgent` — Object with `stdin`, `child`, `ended`, and `terminateActiveDashes()` for steering target.
- `_steerSeq` — Counter for unique steer prompt IDs (`steer-1`, `steer-2`, …).

---

## Blank-Line Condensation

Consecutive blank lines in streamed sub-agent text collapse into a single `-` separator line to reduce vertical clutter. The dash line is emitted in real-time (one `-` per blank line) and terminated with a newline when the next non-blank line arrives.

---

## Error Handling

- **File not found:** `parseLoopState()` returns safe defaults (`canLoop: false`, all fields `undefined`); `listEligibleTodoFiles()` returns `[]`.
- **RPC failures:** Context stats silently omitted; extension continues normally. Rejected `kickoff` RPC responses resolve `runSubAgent()` with `{ ok: false, error }`.
- **Process exit & spawn errors:** `runSubAgent()` resolves on process exit or child `error` event (guarded against double-resolution) and returns `{ ok: false, error }` on spawn failures or any exit before `agent_end` — including a silent exit with code 0. `/pipeline-cleanup` halts immediately whenever `result.ok === false`.
- **Infinite loop & cap guards:** Warns and stops after `STUCK_THRESHOLD` (3) consecutive same-role runs, enforces `MAX_SESSIONS` (50) sessions per loop, and (in `/pipeline-cleanup`) enforces `MAX_CLEANUP_LOOPS` (20) loops plus the mid-work change and zero-progress stops.
