# Pipeline-Auto Extension — API Documentation

## Overview

`pipeline-auto.ts` is a [pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) extension that runs the sequential role pipeline autonomously. It spawns sub-agents via RPC mode, streams their output live, and auto-responds to UI dialogs with recommended defaults.

**Location:** `.pi/extensions/pipeline-auto.ts`  
**Command:** `/pipeline-auto`  

---

## Commands

| Command | Description |
|---------|-------------|
| `/pipeline-auto` | Start the pipeline — reads `loop_state.md`, spawns sub-agent for current role, loops until Finalizer completes |
| `/pipeline-auto --help` | Show help text with usage instructions and feature list |

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

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_SESSIONS` | `50` | Maximum number of sub-agent sessions per pipeline run (safety limit) |
| `STUCK_THRESHOLD` | `3` | Warn after this many consecutive same-role runs (infinite-loop detection) |
| `LOOP_STATE_FILE` | `"ai_workspace/loop_state.md"` | Path to the loop state file, relative to project root |

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

### `runSubAgent(cwd: string): Promise<void>`

Runs a single sub-agent session via RPC mode. This is the core function that spawns child processes, handles JSONL communication, streams text live, and manages context-aware wind-down.

**Parameters:**
- `cwd` — Current working directory (project root).

**Returns:** Promise that resolves when `agent_end` is received or the process exits.

**Key Behaviors:**
- Spawns `pi --mode rpc --no-session --append-system-prompt <AUTO_ACCEPT_INSTRUCTIONS>`
- Streams non-thinking text via `message_update/text_delta` events with line buffering
- Shows tool calls inline: 🧰 name, ✅ success, ❌ error (with immediate result emission)
- Polls context usage on every buffer flush for real-time token display
- Triggers low-context wind-down when remaining tokens drop below 15k
- Auto-responds to extension UI dialogs via `autoRespondUiRequest()`

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

## Auto-Run System Prompt

The extension appends this system prompt to every sub-agent so it never blocks waiting on user input:

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

During a pipeline run, users can type plain text into the TUI to forward it directly to the active sub-agent. The extension echoes steering input as `🎯 Steering → <text>` and forwards it as an RPC message on the sub-agent's stdin.

**Module-level state:**
- `_pipelineRunning` — Boolean flag set by `/pipeline-auto` command handler, read by `input` event listener.
- `_activeSubAgent` — Object with `stdin`, `child`, `ended`, and `terminateActiveDashes()` for steering target.
- `_steerSeq` — Counter for unique steer prompt IDs (`steer-1`, `steer-2`, …).

---

## Blank-Line Condensation

Consecutive blank lines in streamed sub-agent text collapse into a single `-` separator line to reduce vertical clutter. The dash line is emitted in real-time (one `-` per blank line) and terminated with a newline when the next non-blank line arrives.

---

## Error Handling

- **File not found:** `parseLoopState()` returns safe defaults (`canLoop: false`, all fields `undefined`).
- **RPC failures:** Context stats silently omitted; extension continues normally.
- **Process exit:** `runSubAgent` resolves on process exit regardless of whether `agent_end` was received (guard against double-resolution).
- **Infinite loop detection:** Warns after `STUCK_THRESHOLD` (3) consecutive same-role runs. Hard limit at `MAX_SESSIONS` (50) sessions.
