/**
 * Pipeline-Auto Extension — Sequential sub-agent pipeline runner with live streaming
 *
 * Spawns pi subprocesses in RPC mode. Each subprocess follows the project's AGENTS.md
 * workflow (roles, loop_state.md, transition_guide). The extension is completely generic —
 * it never references role names or counts. It only:
 *   1. Reads loop_state.md to display current status and detect infinite loops.
 *   2. Checks whether loop_state.md still exists after each run (Finalizer deletes it).
 *   3. Monitors can_loop flag on turn_end events and shows proactive footer status.
 *
 * Non-thinking text from sub-agents streams live via RPC message_update/text_delta events.
 * Extension UI dialogs are auto-responded with recommended/default values.
 *
 * Usage: /pipeline-auto          — start the pipeline
 *        /pipeline-auto --help   — show help text
 */

import { spawn, type ChildProcess } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionCommandContext, InputEvent } from "@earendil-works/pi-coding-agent";

const MAX_SESSIONS = 50;
const LOOP_STATE_FILE = "ai_workspace/loop_state.md";
const STUCK_THRESHOLD = 3; // warn after this many consecutive same-role runs

// Track whether pipeline-auto has completed a run in this extension lifecycle.
// Used to clear previous output when user types /new after the pipeline finishes.
let _pipelineCompleted = false;

// Track role at session start to detect handoffs mid-session.
let _sessionStartRole: string | undefined = undefined;

// Track the last known role from loop_state.md so we can detect post-Finalizer completion
// even when the session started on an earlier role and progressed through Finalizer mid-session.
let _lastKnownRole: string | undefined = undefined;

// Cache goal summary at session start so it survives loop_state.md deletion by Finalizer.
let _cachedGoalSummary: string | undefined = undefined;

// Pipeline run state for live steering input — set by the /pipeline-auto command handler,
// read by the `input` event handler in the default export. While a pipeline run is active,
// plain TUI text is forwarded to the working sub-agent instead of starting an LLM turn here.
let _pipelineRunning = false;
let _activeSubAgent: { stdin: NodeJS.WritableStream; ended: boolean; terminateActiveDashes: () => void } | null = null;
let _steerSeq = 0; // counter for unique steer prompt ids (steer-1, steer-2, …)

/**
 * Resolve the path to the pi executable that should be used for spawning.
 */
function getPiCommand(): { command: string; args: string[] } {
    const entry = process.argv[1];
    if (entry && fs.existsSync(entry)) {
        return { command: process.execPath, args: [entry] };
    }
    return { command: "pi", args: [] };
}

/**
 * Parsed state from loop_state.md — all values extracted in a single file read.
 */
interface LoopStateParsed {
    goalSummary: string | undefined;
    currentRole: string | undefined;
    canLoop: boolean;
    isSendBack: boolean;
}

/**
 * Read and parse loop_state.md once, extracting all header values (lines 1–3).
 * Replaces five separate fs.readFileSync calls with a single read.
 */
function parseLoopState(cwd: string): LoopStateParsed {
    let content: string;
    try {
        content = fs.readFileSync(path.join(cwd, LOOP_STATE_FILE), "utf-8");
    } catch {
        return { goalSummary: undefined, currentRole: undefined, canLoop: false, isSendBack: false };
    }

    const lines = content.split("\n");

    // Line 1 — Goal Summary
    let goalSummary: string | undefined;
    if (lines.length >= 1) {
        const line1 = lines[0].replace(/<br>\s*$/, "");
        const match = line1.match(/\*\*Goal Summary:\*\*\s*(.+)/i);
        goalSummary = match ? match[1].trim() : undefined;
    }

    // Line 2 — Current Role + send-back detection
    let currentRole: string | undefined;
    let isSendBack = false;
    if (lines.length >= 2) {
        const line2 = lines[1].replace(/<br>\s*$/, "");
        const roleMatch = line2.match(/\*\*Current Role:\*\*\s*(.+?)(?:\s+(?:\(in-sendback\)\s+)?\(Role\s+\d+\)|\s+\|)/i);
        currentRole = roleMatch ? roleMatch[1].trim() : undefined;
        isSendBack = /\(in-sendback\)/i.test(line2);
    }

    // Line 3 — can_loop flag
    let canLoop = false;
    if (lines.length >= 3) {
        const line3 = lines[2].replace(/<br>\s*$/, "");
        const pairs = line3.split(" | ");
        for (const pair of pairs) {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1) continue;
            const key = pair.substring(0, eqIdx).trim();
            const value = pair.substring(eqIdx + 1).trim();
            if (key === "can_loop" && (value === "true" || value === "false")) {
                canLoop = value === "true";
                break;
            }
        }
    }

    return { goalSummary, currentRole, canLoop, isSendBack };
}

/**
 * Parse line 2 of loop_state.md to extract the current role name.
 * Kept for callers outside updateStatus (pipeline-auto handler, session_start).
 */
function getCurrentRole(cwd: string): string | undefined {
    return parseLoopState(cwd).currentRole;
}

/**
 * Parse line 1 of loop_state.md to extract the goal summary.
 * Kept for callers outside updateStatus (session_start caching).
 */
function getGoalSummary(cwd: string): string | undefined {
    return parseLoopState(cwd).goalSummary;
}

/**
 * Parse line 3 of loop_state.md to extract the can_loop flag.
 * Kept for callers outside updateStatus (pipeline-auto handler guard).
 */
function parseCanLoop(cwd: string): boolean {
    return parseLoopState(cwd).canLoop;
}

/**
 * Check whether the current role is in send-back mode.
 * Reads line 2 of loop_state.md for `(in-sendback)` suffix.
 */
function isInSendBack(cwd: string): boolean {
    return parseLoopState(cwd).isSendBack;
}

/**
 * Check whether loop_state.md still exists.
 * The Finalizer deletes it when the pipeline is complete.
 */
function loopStateExists(cwd: string): boolean {
    try {
        return fs.statSync(path.join(cwd, LOOP_STATE_FILE)).isFile();
    } catch {
        return false;
    }
}

/**
 * System prompt appended to every sub-agent so it never blocks waiting on the user.
 */
const AUTO_ACCEPT_INSTRUCTIONS = `

### Auto-Run Mode (No User Interaction)
You are running in an automated pipeline with no human at the keyboard. Follow these rules for ALL decision points:

1. **Never ask the user a question.** Do not wait for input, confirmation, or feedback.
2. **Always pick the recommended/default options.** When presented with "(recommended) or other options", choose the recommended options silently and proceed.
3. **If any options are equally valid**, pick one deterministically (first listed) and state your choice briefly before continuing.
4. **Skip all user-facing prompts** — do not greet the user, ask clarifying questions, or request approval. Just act.
5. **Complete your full task** including transition steps (summary to loop_state.md, git commit, handoff message). Do not stop early because you would normally wait for feedback.
6. **Make your own decisions for all options** — Default to absorb out of scope changes, send-back in scope issues, create a todo for out of scope issues, etc.
7. **This instruction overrides your role instructions** Do not follow role instructions to ask for user decisions, remember, you are in Auto-Run Mode!`;

/**
 * Send an RPC command on stdin and return the raw line (no parsing).
 */
function sendRpcCommand(stdin: NodeJS.WritableStream, cmd: Record<string, unknown>): void {
    stdin.write(JSON.stringify(cmd) + "\n");
}

/**
 * Auto-respond to an extension_ui_request with recommended/default values.
 */
function autoRespondUiRequest(
    stdin: NodeJS.WritableStream,
    request: Record<string, unknown>,
): void {
    const id = request.id as string;
    const method = request.method as string;

    switch (method) {
        case "confirm":
            sendRpcCommand(stdin, { type: "extension_ui_response", id, confirmed: true });
            break;
        case "select":
            // Pick first option (recommended/default per pipeline conventions)
            const options = request.options as string[] | undefined;
            sendRpcCommand(stdin, {
                type: "extension_ui_response",
                id,
                value: options?.[0] ?? "",
            });
            break;
        case "input":
            sendRpcCommand(stdin, { type: "extension_ui_response", id, value: "" });
            break;
        case "editor":
            sendRpcCommand(stdin, { type: "extension_ui_response", id, value: "" });
            break;
        // Fire-and-forget methods (notify, setStatus, setWidget, setTitle) need no response
        default:
            break;
    }
}

/**
 * Run a single sub-agent session via RPC mode.
 * Streams non-thinking text_deltas live to stdout.
 * Auto-responds to extension UI dialogs with recommended defaults.
 * Resolves when agent_end is received or the process exits.
 */
function runSubAgent(cwd: string): Promise<void> {
    return new Promise((resolve) => {
        const { command, args: baseArgs } = getPiCommand();

        // RPC mode (--mode rpc), no session file (each sub-agent gets ephemeral context).
        // --append-system-prompt injects auto-accept rules so roles never block on user input.
        const childArgs = [
            ...baseArgs,
            "--mode", "rpc",
            "--no-session",
            "--append-system-prompt", AUTO_ACCEPT_INSTRUCTIONS.trim(),
        ];

        const child: ChildProcess = spawn(command, childArgs, {
            cwd,
            stdio: ["pipe", "pipe", "inherit"], // stdin pipe, stdout pipe, stderr inherit
            shell: false,
            maxBuffer: 50 * 1024 * 1024, // 50 MB — generous for long agent runs
        });

        // Expose this sub-agent to the module-level steering input handler. Marked ended on
        // agent_end (so steering typed in that window gets a notice, not a rejected steer) and
        // cleared in safeResolve on every exit path.
        let dashesEmitted = false;
        let currentToolArgs = "";

        function terminateActiveDashes(): void {
            if (dashesEmitted) {
                process.stdout.write("\n");
                dashesEmitted = false;
            }
        }
        
        _activeSubAgent = { stdin: child.stdin!, ended: false, terminateActiveDashes };

        const decoder = new StringDecoder("utf-8");
        let jsonBuffer = ""; // raw JSONL from stdout
        let textBuffer = ""; // accumulated text_delta content, flushed line-by-line
        let agentEnded = false;
        let resolved = false; // guard against double-resolution

        const pendingTools: Array<{ name: string; status: "pending" | "success" | "error" }> = [];

        // Context usage state, updated by get_session_stats responses
        let contextUsageTokens: number | null = null;
        let contextUsageWindow: number | null = null;
        let contextUsagePercent: number | null = null;

        /**
         * Send a get_session_stats RPC command to poll for current token usage.
         * Response is handled asynchronously — updates prefix value on arrival.
         */
        function fetchContextStats(stdin: NodeJS.WritableStream): void {
            sendRpcCommand(stdin, { type: "get_session_stats" });
        }

        /** Build a colored context usage prefix string using ANSI codes. */
        function buildColoredPrefix(): string {
            if (contextUsageTokens === null || contextUsageWindow === null || contextUsagePercent === null) {
                return "";
            }
            const raw = `${(contextUsageTokens / 1000).toFixed(1)}k /${(contextUsageWindow / 1000).toFixed(1)}k (${contextUsagePercent.toFixed(1)}%) `;
            // ANSI color based on usage percentage (green < 70%, yellow 70-90%, red > 90%)
            let color: string;
            if (contextUsagePercent < 70) {
                color = "\x1b[32m"; // green
            } else if (contextUsagePercent < 90) {
                color = "\x1b[33m"; // yellow
            } else {
                color = "\x1b[31m"; // red
            }
            return `${color}${raw}\x1b[0m`;
        }

        /**
         * Emit a single streamed line — the only place the blank-line rule and
         * token-prefix logic live. Blank (empty/whitespace-only) lines accumulate
         * and are emitted as a string of dashes in real-time. Non-blank lines 
         * terminate the dash line, get the context usage prefix, and are emitted as-is.
         */
        function emitLine(line: string): void {
            if (line.trim().length === 0) {
                process.stdout.write("-");
                dashesEmitted = true;
                return;
            }
            terminateActiveDashes();
            const prefix = buildColoredPrefix();
            console.log(prefix ? `${prefix} ${line}` : line);
        }

        /** Flush buffered text line-by-line, keeping the last incomplete segment. */
        function flushBufferedLines(): void {
            // Trigger a stats poll on every flush (async — response updates prefix later)
            fetchContextStats(child.stdin!);

            const lines = textBuffer.split("\n");
            // Keep the last (possibly incomplete) segment in the buffer
            for (let i = 0; i < lines.length - 1; i++) {
                emitLine(lines[i]);
            }
            textBuffer = lines[lines.length - 1];
        }

        /** Flush all buffered text including pending tool call results. */
        function flushAllBufferedText(): void {
            // Print any pending tool call results inline if they errored.
            // Since we now print the tool immediately at start, we only need to report failures at the end if not already reported.
            if (pendingTools.length > 0) {
                for (const tool of pendingTools) {
                    if (tool.status === "error") {
                        emitLine(`  \u274C ${tool.name} failed`);
                    }
                }
                pendingTools.length = 0;
            }
            if (textBuffer) {
                // Trailing remainder: apply the same condensation rule at stream end.
                // (An empty remainder — text ended on a newline — emits nothing.)
                emitLine(textBuffer);
                textBuffer = "";
            }
            terminateActiveDashes();
        }

        // Low-context wind-down state (per session): the warning is sent at most once,
        // whichever trigger fires first.
        let windDownSent = false;

        /**
         * Send the low-context wind-down instruction (once per session).
         * The sub-agent saves progress to loop_state.md and ends its stream; the
         * orchestrator's existing loop then spawns a fresh session that resumes from
         * inline progress tracking — no new restart machinery.
         */
        function sendWindDown(reason: string): void {
            if (windDownSent) return;
            windDownSent = true;
            terminateActiveDashes();
            console.log("");
            console.log(`  \u26A0 Low context detected (${reason}) — sending wind-down instruction…`);
            const message =
                "Context is nearly exhausted. Stop starting new work immediately. Update ai_workspace/loop_state.md now with your current progress — update the Current-Role Steps checkboxes in your role's summary section and add any inline notes a fresh session needs to resume. Then end your stream; do not transition to another role. A new session will pick up from loop_state.md.";
            sendRpcCommand(child.stdin!, {
                id: "wind-down",
                type: "prompt",
                message,
                // Delivered after the current turn's tool calls finish (or right after
                // compaction completes), before the next LLM call.
                streamingBehavior: "steer",
            });
        }

        // Parse JSONL from stdout (split on \n only per RPC protocol)
        function processLine(line: string): void {
            if (!line.trim()) return;

            let parsed: Record<string, unknown>;
            try {
                parsed = JSON.parse(line);
            } catch {
                // Non-JSON output — pass through (e.g., startup noise)
                return;
            }

            const type = parsed.type as string | undefined;

            // Extension UI request — auto-respond with recommended defaults
            if (type === "extension_ui_request") {
                autoRespondUiRequest(child.stdin!, parsed);
                return;
            }

            if (type === "message_update") {
                const event = parsed.assistantMessageEvent as Record<string, unknown> | undefined;
                if (!event) return;

                switch (event.type as string) {
                    case "text_delta":
                        // Accumulate text and flush line-by-line on newlines
                        textBuffer += event.delta as string;
                        flushBufferedLines();
                        break;
                    case "toolcall_start":
                        // Flush any pending text (including queued tool results)
                        flushAllBufferedText();
                        currentToolArgs = "";
                        const name = event.toolName as string | undefined;
                        if (name) {
                            pendingTools.push({ name, status: "pending" });
                            // Print immediately so user doesn't stare at a blank line while tool runs
                            emitLine(`  \u{1F9F0} Tool: ${name}`);
                        }
                        break;
                    case "toolcall_delta":
                        const delta = event.delta as string | undefined;
                        if (delta) {
                            currentToolArgs += delta;
                        }
                        break;
                    case "toolcall_end":
                        // Mark the last pending tool with its result status
                        const isError = event.isError as boolean | undefined;
                        if (pendingTools.length > 0) {
                            const lastTool = pendingTools[pendingTools.length - 1];
                            lastTool.status = isError ? "error" : "success";
                            
                            let argNote = "";
                            if (currentToolArgs) {
                                try {
                                    const argsObj = JSON.parse(currentToolArgs) as Record<string, unknown>;
                                    for (const [k, v] of Object.entries(argsObj)) {
                                        if (typeof v === "string" && v.trim().length > 0) {
                                            if (v.includes("/") || v.includes("\\") || v.includes(".")) {
                                                argNote = ` (${path.basename(v)})`;
                                                break;
                                            } else if (k.toLowerCase().includes("command") || k.toLowerCase() === "cmd") {
                                                argNote = ` (${v.length > 20 ? v.substring(0, 20) + "..." : v})`;
                                                break;
                                            }
                                        }
                                    }
                                } catch {}
                            }
                            
                            const emoji = lastTool.status === "error" ? "\u274C" : "\u2705";
                            emitLine(`  ${emoji} ${lastTool.name}${argNote}`);
                        }
                        break;
                    // thinking_delta, text_start, text_end, etc. — silently handled
                }
                return;
            }

            // Handle get_session_stats response — update context usage prefix
            if (type === "response" && parsed.command === "get_session_stats") {
                const data = parsed.data as Record<string, unknown> | undefined;
                const stats = data?.contextUsage as Record<string, unknown> | undefined;
                if (stats) {
                    const tokens = stats.tokens as number | null | undefined;
                    const window = stats.contextWindow as number | undefined;
                    const percent = stats.percent as number | null | undefined;
                    // contextUsage.tokens and .percent can be null immediately after compaction
                    if (tokens !== null && tokens !== undefined && window !== undefined && percent !== null && percent !== undefined) {
                        contextUsageTokens = tokens;
                        contextUsageWindow = window;
                        contextUsagePercent = percent;
                    } else {
                        contextUsageTokens = contextUsageWindow = contextUsagePercent = null; // data incomplete or null post-compaction
                    }
                } else {
                    contextUsageTokens = contextUsageWindow = contextUsagePercent = null; // no model/window available
                }
                // Low-context wind-down trigger A: stats show fewer than 15k tokens remaining.
                if (!windDownSent && contextUsageTokens !== null && contextUsageWindow !== null) {
                    const remaining = contextUsageWindow - contextUsageTokens;
                    if (remaining < 15000) {
                        sendWindDown(`stats: ${remaining} tokens left`);
                    }
                }
                return;
            }

            // Steering / wind-down prompt responses — warn if rejected before acceptance
            // (e.g., steering typed just as the sub-agent ended). Failures after acceptance
            // surface through the normal event stream, not here.
            if (type === "response" && parsed.command === "prompt") {
                const id = parsed.id as string | undefined;
                if ((id?.startsWith("steer-") || id === "wind-down") && parsed.success !== true) {
                    terminateActiveDashes();
                    console.log("");
                    console.log(`  \u26A0 Message not delivered (${id}) — sub-agent may have just ended.`);
                }
                return;
            }

            if (type === "compaction_start") {
                flushAllBufferedText();
                console.log("");
                console.log("  \u{1F504} Compacting context...");
                // Low-context wind-down trigger B: auto-compaction at threshold/overflow means
                // the session is below pi's context reserve — instruct it to save state and end.
                // (Manual /compact does not trigger wind-down.) The steer queue delivers the
                // message before the next LLM call, i.e., right after compaction completes.
                const reason = parsed.reason as string | undefined;
                if ((reason === "threshold" || reason === "overflow") && !windDownSent) {
                    sendWindDown(`compaction: ${reason}`);
                }
                // Reset stats — data is stale after compaction until fresh response arrives
                contextUsageTokens = contextUsageWindow = contextUsagePercent = null;
                return;
            }

            // Agent events — flush buffered text, close stdin to trigger process exit
            if (type === "agent_end") {
                flushAllBufferedText();
                agentEnded = true;
                // Mark the steering handle as ended so input typed in this window gets a notice.
                if (_activeSubAgent?.stdin === child.stdin) {
                    _activeSubAgent.ended = true;
                }
                // Close stdin so the RPC server sees EOF and exits.
                // Without this, pi --mode rpc stays alive waiting for more commands,
                // and the "exit" event never fires (hanging the pipeline loop).
                try { child.stdin?.end(); } catch {}
                return;
            }
        }

        child.stdout?.on("data", (chunk: Buffer) => {
            jsonBuffer += decoder.write(chunk);

            while (true) {
                const newlineIndex = jsonBuffer.indexOf("\n");
                if (newlineIndex === -1) break;

                let line = jsonBuffer.slice(0, newlineIndex);
                jsonBuffer = jsonBuffer.slice(newlineIndex + 1);
                // Strip trailing \r per RPC protocol framing rules
                if (line.endsWith("\r")) line = line.slice(0, -1);

                processLine(line);
            }
        });

        child.stdout?.on("end", () => {
            // Process any remaining buffered JSONL data
            if (jsonBuffer.length > 0) {
                const line = jsonBuffer.endsWith("\r") ? jsonBuffer.slice(0, -1) : jsonBuffer;
                processLine(line);
            }
        });

        // Send the initial prompt to start the sub-agent working
        const kickoffMessage =
            "Hello. I will be stepping away from the computer. Please load the loop_state.md file and perform your tasks without me. Please automatically select your recommendations (do not prompt me for decisions) and continue working without me.";

        sendRpcCommand(child.stdin!, {
            id: "kickoff",
            type: "prompt",
            message: kickoffMessage,
        });

        function safeResolve() {
            if (resolved) return;
            resolved = true;
            // Clear the steering handle on every exit path so input falls through to normal behavior.
            _activeSubAgent = null;
            resolve();
        }

        // Resolve when process exits (triggered by stdin.end after agent_end)
        child.on("exit", (code, signal) => {
            if (!agentEnded && code !== 0) {
                terminateActiveDashes();
                console.log("");
                console.log(`  \u26A0 Sub-agent exited with code ${code}${signal ? ` / ${signal}` : ""}.`);
            }
            safeResolve();
        });

        child.on("error", (err) => {
            terminateActiveDashes();
            console.log("");
            console.log(`  \u274C Failed to spawn sub-agent: ${err.message}`);
            safeResolve();
        });


    });
}

function printHelp(): void {
    console.log(`
Pipeline-Auto — Sequential sub-agent pipeline runner with live streaming

Spawns pi subprocesses in RPC mode. Each follows the project's AGENTS.md workflow
(roles, loop_state.md, transitions). Non-thinking text streams live as it generates.
The extension is role-agnostic: it never hardcodes role names or counts.

Options:
  /pipeline-auto              Start the pipeline (max ${MAX_SESSIONS} sessions)
  /pipeline-auto --help       Show this help text

Safety features:
  - Max ${MAX_SESSIONS} sequential sessions (hard stop)
  - Infinite-loop detection: warns if same role repeats ${STUCK_THRESHOLD}+ times
  - Pipeline ends when Finalizer deletes loop_state.md
  - can_loop guard: command exits early if can_loop is not yet enabled by the Planner

Streaming:
  Non-thinking text from sub-agents streams live via RPC events.
  Tool calls are shown inline. Extension UI dialogs are auto-accepted.
  Blank lines in streamed output condense to "-" separator lines (runs of
  consecutive blanks collapse into a single one).

Steering (live input):
  While a pipeline run is active, plain text typed into the TUI is forwarded to
  the working sub-agent at its next turn boundary and echoed as "\u{1F3AF} Steering → …".
  No flag or prefix needed. Commands ("/…") and inline bash ("!…") pass through
  untouched. Text typed in the brief window between sessions is not forwarded —
  a notice is shown instead.

Low-context wind-down:
  When a sub-agent session runs low on context (fewer than 10k tokens remaining,
  or pi's auto-compaction triggers), the extension sends it a one-time instruction
  to save progress to ai_workspace/loop_state.md and end its stream. The pipeline
  then spawns a fresh session that resumes from loop_state.md — no work is lost.`);
}

async function handler(_args: string, ctx: ExtensionCommandContext): Promise<void> {
    if (_args.trim() === "--help" || _args.trim() === "-h") {
        printHelp();
        return;
    }

    const cwd = ctx.cwd;

    // Guard: can_loop must be true (set by Planner) before auto-looping is allowed
    if (!parseCanLoop(cwd)) {
        console.log("");
        console.log("Auto-looping is not yet enabled. The Planner has not yet enabled auto-looping.");
        return;
    }

    // Live steering input becomes active for the duration of this run — plain TUI text typed
    // while a sub-agent works is forwarded to it instead of starting an LLM turn in this session.
    _pipelineRunning = true;

    const roleHistory: string[] = [];

    // Clear terminal (screen + scrollback) before pipeline banner.
    // Delayed to avoid race condition with pi's TUI status bar rendering —
    // if we clear immediately, pi may draw its footer items after our escape codes,
    // leaving them as artifacts on screen.
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
            resolve();
        }, 100);
    });

    console.log("");
    console.log("═".repeat(60));
    console.log("  Auto-Loop Pipeline Runner");
    console.log(`  Max sessions: ${MAX_SESSIONS}`);
    console.log(`  Working dir:  ${cwd}`);
    console.log("═".repeat(60));

    try {
        for (let i = 1; i <= MAX_SESSIONS; i++) {
            const role = getCurrentRole(cwd);

            // Print session header with current role info
            console.log("");
            console.log(`── Session ${i}/${MAX_SESSIONS}`);
            console.log("═".repeat(60));
            console.log("");

            if (role) {
                console.log(`   Role: ${role}`);
            } else if (i === 1) {
                console.log("   Role: (first run — Interviewer will create loop_state.md)");
            } else {
                console.log("   Role: (unknown — loop_state.md may be stale)");
            }

            // Infinite-loop detection: same role repeated STUCK_THRESHOLD+ times
            if (role && roleHistory.length >= STUCK_THRESHOLD - 1) {
                const recent = [...roleHistory.slice(-(STUCK_THRESHOLD - 1)), role];
                if (recent.every((r) => r === role)) {
                    console.log("");
                    console.log("\u26A0 WARNING: Possible infinite loop detected!");
                    console.log(`  "${role}" has run ${STUCK_THRESHOLD}+ times consecutively.`);
                    console.log("  Stopping pipeline. Check your role files and transition_guide.");
                    return;
                }
            }

            if (role) {
                roleHistory.push(role);
                // Keep history bounded to avoid unbounded memory growth at 50 sessions
                if (roleHistory.length > STUCK_THRESHOLD * 2) {
                    roleHistory.splice(0, roleHistory.length - STUCK_THRESHOLD);
                }
            }

            // Run the sub-agent session (async — streams live via RPC events)
            try {
                await runSubAgent(cwd);
            } catch (err) {
                console.log("");
                console.log(`  \u274C Sub-agent error: ${err instanceof Error ? err.message : String(err)}`);
            }

            // Brief pause to let filesystem flush loop_state.md writes
            // (Finalizer may delete it; we need to see that on next check)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Check if pipeline is complete (loop_state.md deleted by Finalizer)
            if (!loopStateExists(cwd)) {
                console.log("");
                console.log("\u2713 Pipeline complete — loop_state.md removed by Finalizer.");
                console.log(`  Finished in ${i} session${i > 1 ? "s" : ""}. Type /new to continue to a new session.`);
                _pipelineCompleted = true;
                return;
            }
        }
    } finally {
        // Always reset the running flag so steering input returns to normal TUI behavior,
        // regardless of which exit path was taken (loop detection, completion, max sessions).
        _pipelineRunning = false;
    }

    // Safety cutoff reached
    _pipelineCompleted = true;
    console.log("");
    console.log(`\u26A0 Max sessions (${MAX_SESSIONS}) reached. Stopping.`);
    console.log("  If the pipeline should still be running, check for infinite loops.");
}

export default function (pi: ExtensionAPI) {
    pi.registerCommand("pipeline-auto", {
        description: "Run the role pipeline autonomously via sequential sub-agent sessions",
        handler,
    });

    // Live steering input: while a pipeline run is active, plain TUI text typed by the user is
    // forwarded to the working sub-agent (delivered at its next turn boundary) instead of starting
    // an LLM turn in this session. Commands ("/…") and inline bash ("!…") pass through untouched —
    // forwarding command syntax into a sub-agent could be harmful (e.g., nested /pipeline-auto).
    pi.on("input", (event: InputEvent) => {
        if (!_pipelineRunning || event.source !== "interactive") return; // feature inert — normal behavior
        const text = event.text;
        if (!text.trim()) return; // whitespace-only input — let normal processing handle it
        if (text.startsWith("/") || text.startsWith("!")) return; // TUI commands / inline bash pass through

        if (_activeSubAgent && !_activeSubAgent.ended) {
            _activeSubAgent.terminateActiveDashes();
            const id = `steer-${++_steerSeq}`;
            sendRpcCommand(_activeSubAgent.stdin, {
                id,
                type: "prompt",
                message: text,
                // Delivered after the current turn's tool calls finish, before the next LLM call.
                streamingBehavior: "steer",
            });
            console.log(`\u{1F3AF} Steering → ${text}`);
            return { action: "handled" }; // consume — no LLM turn starts in this session
        }

        // Brief between-sessions window (or sub-agent just ended) — text can't be forwarded.
        console.log(`  \u26A0 No active sub-agent session — "${text}" was not forwarded.`);
        return { action: "handled" };
    });

    // Proactive monitoring: show role + goal summary in footer, plus auto-work availability
    const updateStatus = (ctx: unknown) => {
        const c = ctx as { hasUI?: boolean; cwd?: string; ui?: { setStatus: (key: string, text: string | undefined) => void } };
        if (!c?.hasUI || !c?.cwd || !c?.ui) return; // no-op in print mode (sub-agent sessions)

        const state = parseLoopState(c.cwd);
        const role = state.currentRole;
        const goal = state.goalSummary;
        const canLoop = state.canLoop;

        // Post-Finalizer ready message: pipeline just completed, file deleted by Finalizer.
        // Show when the last known role was Finalizer AND loop_state.md no longer exists.
        // This works whether the session started as Finalizer or progressed to it mid-session.
        if (_lastKnownRole === "Finalizer" && !loopStateExists(c.cwd)) {
            const cachedGoal = _cachedGoalSummary ?? "(no goal summary)";
            c.ui.setStatus("pipeline-auto", `Pipeline complete | ${cachedGoal} | Ready for new loop`);
            return;
        }

        // Update last known role so we can detect post-Finalizer completion even in mid-session handoffs.
        if (role) {
            _lastKnownRole = role;
        }

        // Build the always-visible status text: role + goal summary
        let parts: string[] = [];
        const displayRole = _sessionStartRole ?? (role ?? "Interviewer");

        // Detect handoff: role in loop_state.md changed since session start
        // Show original role with new role as handoff target
        const isHandoff = role && _sessionStartRole !== undefined && role !== _sessionStartRole;
        let roleLabel = `Role: ${displayRole}`;

        // Append (in-sendback) suffix when current role is in send-back recovery mode
        if (state.isSendBack) {
            roleLabel += " (in-sendback)";
        }

        if (canLoop) {
            roleLabel += " ⚡";
        }
        if (isHandoff) {
            roleLabel += ` (${role} Handoff Ready)`;
        }
        parts.push(roleLabel);

        if (goal) {
            parts.push(goal);
        }

        c.ui.setStatus("pipeline-auto", parts.join(" | "));
    };

    // On session start: capture current role for handoff detection, update footer status.
    pi.on("session_start", (event, ctx) => {
        const c = ctx as { cwd?: string };
        const state = parseLoopState(c.cwd ?? ".");
        _sessionStartRole = state.currentRole ?? "Interviewer";
        _lastKnownRole = state.currentRole;
        _cachedGoalSummary = state.goalSummary;
        updateStatus(ctx);
        const e = event as { reason?: string };
        if (e.reason === "new" && _pipelineCompleted) {
            process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
            _pipelineCompleted = false;
        }
    });
    // On each turn end to pick up changes mid-session
    pi.on("turn_end", (_event, ctx) => updateStatus(ctx));
    // Final checkpoint after agent fully completes — catches post-Finalizer loop_state.md deletion
    pi.on("agent_end", (_event, ctx) => updateStatus(ctx));
    // Clear footer status on session replacement (/new, /resume, /fork)
    pi.on("session_shutdown", (_event, ctx) => {
        const c = ctx as { hasUI?: boolean; ui?: { setStatus: (key: string, text: string | undefined) => void } };
        if (!c?.hasUI || !c?.ui) return;
        c.ui.setStatus("pipeline-auto", undefined);
    });
}
