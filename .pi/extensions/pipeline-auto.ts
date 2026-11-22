/**
 * Pipeline-Auto Extension — Sequential sub-agent pipeline & TODO cleanup runners with live streaming
 *
 * Spawns pi subprocesses in RPC mode. Each subprocess follows the project's AGENTS.md
 * workflow (roles, loop_state.md, transition_guide).
 *
 * Commands:
 *   - `/pipeline-auto`    — Role-agnostic single-loop runner (requires `can_loop=true` set by
 *                           Planner); reads loop_state.md for status/stuck detection and stops
 *                           when Finalizer deletes loop_state.md.
 *   - `/pipeline-cleanup` — Multi-loop TODO cleanup runner starting from Interviewer (Role 01)
 *                           when no loop is active; scans `ai_workspace/TODO/` (excluding
 *                           `TODO_manual_review_*.md`), drains eligible self-contained TODOs
 *                           across up to MAX_CLEANUP_LOOPS loops, and stops cleanly or on
 *                           mid-work warnings, errors, stuck detection, or zero progress.
 *
 * Non-thinking text from sub-agents streams live via RPC message_update/text_delta events.
 * Extension UI dialogs are auto-responded with recommended/default values.
 *
 * Usage: /pipeline-auto             — start the autonomous pipeline for the active loop
 *        /pipeline-auto --help      — show /pipeline-auto help text
 *        /pipeline-cleanup          — drain eligible TODOs across sequential cleanup loops
 *        /pipeline-cleanup --help   — show /pipeline-cleanup help text
 */

import { spawn, type ChildProcess } from "node:child_process";
import { StringDecoder } from "node:string_decoder";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionCommandContext, InputEvent } from "@earendil-works/pi-coding-agent";

const MAX_SESSIONS = 50;
const LOOP_STATE_FILE = "ai_workspace/loop_state.md";
const STUCK_THRESHOLD = 3; // warn after this many consecutive same-role runs
const FS_FLUSH_DELAY_MS = 1500; // filesystem flush delay after sub-agent session ends
const WIND_DOWN_TOKEN_THRESHOLD = 15000; // low-context wind-down trigger (tokens remaining)
const ARG_TRUNCATION_LIMIT = 20; // tool argument truncation limit in display
export const MAX_CLEANUP_LOOPS = 20; // hard cap on completed cleanup loops per /pipeline-cleanup invocation
const TODO_DIR = "ai_workspace/TODO";
const MANUAL_REVIEW_TODO_PREFIX = "TODO_manual_review_";
export const CLEANUP_STOP_MID_WORK = "[CLEANUP_STOP: MID_WORK_CHANGES]";
export const CLEANUP_STOP_NO_TODOS = "[CLEANUP_STOP: NO_ELIGIBLE_TODOS]";

// Track whether a pipeline command (/pipeline-auto or /pipeline-cleanup) has completed a run
// in this extension lifecycle. Used to clear previous output when user types /new after completion.
let _pipelineCompleted = false;

// Track role at session start to detect handoffs mid-session.
let _sessionStartRole: string | undefined = undefined;

// Track the last known role from loop_state.md so we can detect post-Finalizer completion
// even when the session started on an earlier role and progressed through Finalizer mid-session.
let _lastKnownRole: string | undefined = undefined;

// Cache goal summary at session start so it survives loop_state.md deletion by Finalizer.
let _cachedGoalSummary: string | undefined = undefined;

// Pipeline run state for live steering input — set by the /pipeline-auto and /pipeline-cleanup
// command handlers, read by the `input` event handler in the default export. While a run is active,
// plain TUI text is forwarded to the working sub-agent instead of starting an LLM turn here.
let _pipelineRunning = false;
let _activeSubAgent: { stdin: NodeJS.WritableStream; child: ChildProcess; ended: boolean; terminateActiveDashes: () => void } | null = null;
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
 */
function getCurrentRole(cwd: string): string | undefined {
    return parseLoopState(cwd).currentRole;
}

/**
 * Parse line 3 of loop_state.md to extract the can_loop flag.
 */
function parseCanLoop(cwd: string): boolean {
    return parseLoopState(cwd).canLoop;
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
 * List regular `.md` TODO files in `ai_workspace/TODO/`, strictly excluding
 * consolidated manual-review files (`TODO_manual_review_*.md`, case-insensitive).
 * Returns a deterministically sorted array of filenames, or `[]` if missing/unreadable.
 */
export function listEligibleTodoFiles(cwd: string): string[] {
    const todoDir = path.join(cwd, TODO_DIR);
    try {
        const entries = fs.readdirSync(todoDir, { withFileTypes: true });
        const excludedPrefix = MANUAL_REVIEW_TODO_PREFIX.toLowerCase();
        return entries
            .filter((entry) => {
                if (!entry.isFile()) return false;
                const lower = entry.name.toLowerCase();
                return lower.endsWith(".md") && !lower.startsWith(excludedPrefix);
            })
            .map((entry) => entry.name)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    } catch {
        return [];
    }
}

/**
 * Optional strategy overrides for `runSubAgent()` so `/pipeline-auto` and
 * `/pipeline-cleanup` share identical RPC streaming, steering, and wind-down logic.
 */
interface SubAgentOptions {
    systemPromptAppend?: string;
    kickoffMessage?: string;
}

/**
 * Structured outcome returned by `runSubAgent()`.
 */
interface SubAgentResult {
    ok: boolean;
    error?: string;
    stopSignal?: "mid_work" | "no_eligible_todos";
}

/**
 * Run a single sub-agent session via RPC mode.
 * Streams non-thinking text_deltas live to stdout.
 * Auto-responds to extension UI dialogs with recommended defaults.
 * Resolves with a structured SubAgentResult when agent_end is received or the process exits.
 */
function runSubAgent(cwd: string, options?: SubAgentOptions): Promise<SubAgentResult> {
    return new Promise((resolve) => {
        const { command, args: baseArgs } = getPiCommand();
        const systemPrompt = (options?.systemPromptAppend ?? AUTO_ACCEPT_INSTRUCTIONS).trim();

        // RPC mode (--mode rpc), no session file (each sub-agent gets ephemeral context).
        // --append-system-prompt injects auto-accept rules so roles never block on user input.
        const childArgs = [
            ...baseArgs,
            "--mode", "rpc",
            "--no-session",
            "--append-system-prompt", systemPrompt,
        ];

        const child: ChildProcess = spawn(command, childArgs, {
            cwd,
            stdio: ["pipe", "pipe", "inherit"], // stdin pipe, stdout pipe, stderr inherit
            shell: false,
            maxBuffer: 50 * 1024 * 1024, // 50 MB — generous for long agent runs
        });

        // Prevent unhandled EPIPE errors if the child fails to spawn or closes stdin early.
        child.stdin?.on("error", () => {});

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
        
        _activeSubAgent = { stdin: child.stdin!, child, ended: false, terminateActiveDashes };

        const decoder = new StringDecoder("utf-8");
        let jsonBuffer = ""; // raw JSONL from stdout
        let textBuffer = ""; // accumulated text_delta content, flushed line-by-line
        let agentEnded = false;
        let resolved = false; // guard against double-resolution
        let kickoffError: string | undefined = undefined;
        let stopSignal: "mid_work" | "no_eligible_todos" | undefined = undefined;

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
            const raw = `${contextUsagePercent.toFixed(1)}%/${(contextUsageWindow / 1000).toFixed(0)}k`;
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
         * Inspect a streamed assistant text line for structured `/pipeline-cleanup` stop sentinels.
         * `mid_work` always takes precedence over `no_eligible_todos`.
         *
         * Matching requires the sentinel to occupy the entire line (optional surrounding
         * markdown emphasis/backticks are stripped first), so prose that merely mentions a
         * sentinel does not trigger a stop.
         */
        function inspectTextForStopSignal(line: string): void {
            const trimmed = line.trim();
            // Strip optional surrounding markdown emphasis/backticks so a sentinel wrapped in
            // formatting (e.g. `[CLEANUP_STOP: MID_WORK_CHANGES]`) still matches.
            const normalized = trimmed.replace(/^[`*]+|[`*]+$/g, "").trim();
            if (normalized === CLEANUP_STOP_MID_WORK) {
                stopSignal = "mid_work";
            } else if (stopSignal !== "mid_work" && normalized === CLEANUP_STOP_NO_TODOS) {
                stopSignal = "no_eligible_todos";
            }
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
                inspectTextForStopSignal(lines[i]);
                emitLine(lines[i]);
            }
            textBuffer = lines[lines.length - 1];
        }

        /** Flush all buffered text including pending tool call results. */
        function flushAllBufferedText(): void {
            // Tool results (success/error) are now printed immediately at toolcall_end,
            // so no fallback reporting needed here. Just clear the bookkeeping array.
            pendingTools.length = 0;
            if (textBuffer) {
                // Trailing remainder: apply the same condensation rule at stream end.
                // (An empty remainder — text ended on a newline — emits nothing.)
                inspectTextForStopSignal(textBuffer);
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
                "Context is nearly exhausted. Stop starting new work immediately. Update ai_workspace/loop_state.md now with your current progress — update the Current-Role Steps checkboxes in your role's summary section and add any inline notes a fresh session needs to resume. Then end your stream; do not transition to another role. A new session will pick up from loop_state.md where you leave off.";
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
                        pendingTools.push({ name: "tool", status: "pending" });
                        // We can't print the specific tool name yet because it's not in the start event for some providers
                        emitLine(`  \u{1F9F0} Tool running...`);
                        break;
                    case "toolcall_delta":
                        if (event.delta) {
                            currentToolArgs += event.delta;
                        }
                        break;
                    case "toolcall_end":
                        // The toolcall_end event contains the full toolCall object which has the name
                        const toolCallObj = (event as any).toolCall;
                        const actualName = toolCallObj ? toolCallObj.name : "tool";
                        
                        // Mark the last pending tool with its result status
                        const isError = event.isError as boolean | undefined;
                        if (pendingTools.length > 0) {
                            const lastTool = pendingTools[pendingTools.length - 1];
                            lastTool.name = actualName;
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
                                                argNote = ` (${v.length > ARG_TRUNCATION_LIMIT ? v.substring(0, ARG_TRUNCATION_LIMIT) + "..." : v})`;
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
                    case "thinking_delta":
                        if (typeof event.delta === 'string') {
                            const newlinesCount = (event.delta.match(/\n/g) || []).length;
                            for (let i = 0; i < newlinesCount; i++) {
                                emitLine("");
                            }
                        }
                        break;
                    // text_start, text_end, etc. — silently handled
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
                    if (remaining < WIND_DOWN_TOKEN_THRESHOLD) {
                        sendWindDown(`stats: ${remaining} tokens left`);
                    }
                }
                return;
            }

            // Prompt responses — handle rejected kickoff fatally, and warn on rejected steer/wind-down
            // (e.g., steering typed just as the sub-agent ended). Failures after acceptance
            // surface through the normal event stream, not here.
            if (type === "response" && parsed.command === "prompt") {
                const id = parsed.id as string | undefined;
                if (id === "kickoff" && parsed.success !== true) {
                    const errMsg = typeof parsed.error === "string" && parsed.error.trim().length > 0
                        ? parsed.error.trim()
                        : "Kickoff prompt rejected by sub-agent";
                    kickoffError = errMsg;
                    terminateActiveDashes();
                    console.log("");
                    console.log(`  \u274C Sub-agent rejected kickoff prompt: ${errMsg}`);
                    try { child.stdin?.end(); } catch {}
                    return;
                }
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
            flushAllBufferedText();
        });

        // Send the initial prompt to start the sub-agent working
        const kickoffMessage = options?.kickoffMessage ??
            "Hello. I will be stepping away from the computer. Please load the loop_state.md file and perform your tasks without me. Please automatically select your recommendations (do not prompt me for decisions) and continue working without me.";

        sendRpcCommand(child.stdin!, {
            id: "kickoff",
            type: "prompt",
            message: kickoffMessage,
        });

        function safeResolve(result: SubAgentResult): void {
            if (resolved) return;
            resolved = true;
            // Clear the steering handle on every exit path so input falls through to normal behavior.
            _activeSubAgent = null;
            resolve(result);
        }

        // Resolve when process exits (triggered by stdin.end after agent_end)
        child.on("exit", (code, signal) => {
            flushAllBufferedText();
            if (kickoffError) {
                safeResolve({ ok: false, error: kickoffError, stopSignal });
                return;
            }
            // Any exit before agent_end is an error — including a silent exit code 0. A healthy
            // sub-agent always emits agent_end (which ends stdin and triggers this handler).
            if (!agentEnded) {
                const detail = `Sub-agent exited with code ${code}${signal ? ` / ${signal}` : ""} before agent_end`;
                terminateActiveDashes();
                console.log("");
                console.log(`  \u26A0 ${detail}.`);
                safeResolve({ ok: false, error: detail, stopSignal });
                return;
            }
            safeResolve({ ok: true, stopSignal });
        });

        child.on("error", (err) => {
            terminateActiveDashes();
            console.log("");
            console.log(`  \u274C Failed to spawn sub-agent: ${err.message}`);
            safeResolve({ ok: false, error: `Failed to spawn sub-agent: ${err.message}`, stopSignal });
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
  When a sub-agent session runs low on context (fewer than 15k tokens remaining,
  or pi's auto-compaction triggers), the extension sends it a one-time instruction
  to save progress to ai_workspace/loop_state.md and end its stream. The pipeline
  then spawns a fresh session that resumes from loop_state.md — no work is lost.`);
}

/**
 * Main command handler for `/pipeline-auto`.
 *
 * Validates can_loop guard, clears terminal, then enters the session loop:
 * reads current role from loop_state.md, spawns a sub-agent via runSubAgent(),
 * checks for infinite loops (STUCK_THRESHOLD), and exits when Finalizer
 * deletes loop_state.md or MAX_SESSIONS is reached. Live steering input is
 * active during the entire run (_pipelineRunning flag).
 */
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

            // Check if user terminated via command word
            if (!_pipelineRunning) return;

            // Brief pause to let filesystem flush loop_state.md writes
            // (Finalizer may delete it; we need to see that on next check)
            await new Promise((resolve) => setTimeout(resolve, FS_FLUSH_DELAY_MS));

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

/**
 * System prompt appended to every sub-agent spawned by `/pipeline-cleanup`.
 * Covers autonomous cleanup behavior for Interviewer, Planner, and Worker → Finalizer.
 */
const CLEANUP_AUTO_INSTRUCTIONS = `

### Auto-Cleanup Mode (/pipeline-cleanup — No User Interaction)
You are running inside an automated \`/pipeline-cleanup\` run with no human at the keyboard. Follow these rules for your active role:

**General Auto-Run Rules (All Roles):**
1. **Never ask the user a question.** Do not wait for input, confirmation, or feedback.
2. **Always pick recommended/default options** when presented with choices, or pick deterministically (first listed) when options are equally valid.
3. **Complete your full role workflow** including summary/transition steps and git commits. Do not stop early waiting for user feedback.

**If You Are Interviewer (Role 01):**
1. **Check uncommitted / external git changes (\`git status\` and \`git diff\`):**
   - Absorb minor or settled changes into the loop's commits.
   - If changes look unfinished or mid-work (merge conflict markers, broken/partial syntax, \`WIP\`/\`FIXME\` placeholders, half-implemented edits): do **not** create \`ai_workspace/loop_state.md\`, print a clear warning listing the affected files, emit the exact line \`${CLEANUP_STOP_MID_WORK}\`, and stop immediately.
2. **Scan \`ai_workspace/TODO/\` and select eligible TODOs:**
   - **Strictly ignore all \`TODO_manual_review_*.md\` files** — never read, modify, or delete them.
   - Validate candidate TODOs against the codebase/git history and judge eligibility purely from their contents: select only self-contained items requiring no user feedback, unanswered questions, or ambiguous design decisions. Batching multiple eligible TODOs into a single loop is allowed when it makes sense.
   - If no eligible TODOs remain: do **not** create \`ai_workspace/loop_state.md\`, briefly explain why remaining TODOs were skipped, emit the exact line \`${CLEANUP_STOP_NO_TODOS}\`, and stop immediately.
3. **Create \`loop_state.md\` and transition autonomously:**
   - Skip interactive questioning and wrap-up confirmation.
   - Explicitly name every selected TODO file in your summary and instruct the Planner to mandate a Worker deletion step for each.
   - Choose \`test_level\` and \`do_docs\` using your runtime recommendations, set \`can_loop=false\` on line 3, and commit/transition to Planner (Role 02) per \`transition_guide.md\`.

**If You Are Planner (Role 02):**
1. **Skip Phase 1 user questioning** — record under \`### Pre-Plan Questions\` that Phase 1 was skipped in auto-cleanup mode.
2. **Bypass waiting for manual console approval** — record \`Approval status: Auto-approved (pipeline-cleanup mode)\` in your summary.
3. **Maintain full plan quality** — include architecture/rationale, file/module map, ordered Worker steps (with mandatory Worker TODO-deletion steps for every Interviewer-referenced TODO and mandatory test-creation deferral to Tester), testing strategy, and risks.
4. **Follow the exact write order:** append summary to \`loop_state.md\` → update line 2 handoff to Worker → set \`can_loop=true\` on line 3 → git commit.
5. **Preserve all hard constraints:** never write implementation code, edit project files, scaffold directories, or run build tools.

**If You Are Worker (Role 03) through Finalizer (Role 07):**
- Follow full Auto-Run Mode: make autonomous decisions (absorb out-of-scope changes, send-back in-scope issues, create TODOs for out-of-scope issues, pick recommended options silently) and complete all transitions.`;

const CLEANUP_INTERVIEWER_KICKOFF =
    "Running in /pipeline-cleanup auto-cleanup mode with no human at the keyboard. Load AGENTS.md and Interviewer (Role 01) instructions, follow the Auto-Cleanup Mode rules (check uncommitted changes for mid-work edits, strictly ignore TODO_manual_review_*.md files, autonomously pick eligible self-contained TODOs, or emit the appropriate stop sentinel without creating loop_state.md), and transition to Planner if eligible TODOs are selected.";

const CLEANUP_LOOP_KICKOFF =
    "Running in /pipeline-cleanup auto-cleanup mode with no human at the keyboard. Load ai_workspace/loop_state.md and your active role skill file, follow Auto-Cleanup / Auto-Run rules without waiting for user input or manual approval, and complete your full role workflow and transition.";

/** Print usage instructions and safety/UX feature summary for `/pipeline-cleanup`. */
function printCleanupHelp(): void {
    console.log(`
Pipeline-Cleanup — Automated multi-loop TODO cleanup runner with live streaming

Starts from Interviewer (Role 01) when no loop is active, inspects pending TODOs in
ai_workspace/TODO/, autonomously selects self-contained items requiring no user input,
runs each cleanup loop end-to-end through Planner → Finalizer, and repeats until no
eligible TODOs remain or a stop condition is reached.

Options:
  /pipeline-cleanup           Start automated TODO cleanup (max ${MAX_CLEANUP_LOOPS} loops)
  /pipeline-cleanup --help    Show this help text

Safety features:
  - No-loop-in-progress guard: refuses to start if ai_workspace/loop_state.md exists
  - Manual-review protection: strictly ignores all ${MANUAL_REVIEW_TODO_PREFIX}*.md files
  - Mid-work change guard: stops with a warning if unfinished uncommitted edits are detected
  - Max ${MAX_CLEANUP_LOOPS} complete cleanup loops per invocation (hard stop)
  - Max ${MAX_SESSIONS} sequential sessions per loop (hard stop)
  - Infinite-loop detection: halts immediately if same role repeats ${STUCK_THRESHOLD}+ times
  - Error & zero-progress stops: halts immediately on sub-agent error or if a loop resolves zero eligible TODOs

Streaming:
  Non-thinking text from sub-agents streams live via RPC events.
  Tool calls are shown inline. Extension UI dialogs are auto-accepted.
  Blank lines in streamed output condense to "-" separator lines (runs of
  consecutive blanks collapse into a single one).

Steering (live input):
  While a cleanup run is active, plain text typed into the TUI is forwarded to
  the working sub-agent at its next turn boundary and echoed as "\u{1F3AF} Steering → …".
  No flag or prefix needed. Commands ("/…") and inline bash ("!…") pass through
  untouched. Text typed in the brief window between sessions is not forwarded —
  a notice is shown instead.

Low-context wind-down:
  When a sub-agent session runs low on context (fewer than 15k tokens remaining),
  the extension sends it a one-time instruction to save progress to
  ai_workspace/loop_state.md and end its stream. The runner then spawns a fresh
  session that resumes from loop_state.md — no work is lost.`);
}

/** Print a prominent warning banner when Interviewer signals unfinished mid-work git changes. */
function printMidWorkWarning(completedLoops: number): void {
    console.log("");
    console.log("═".repeat(60));
    console.log("  \u26A0 WARNING: Mid-work uncommitted changes detected!");
    console.log("  The Interviewer detected uncommitted changes that look unfinished");
    console.log("  (e.g., partial edits, conflict markers, or WIP/FIXME placeholders).");
    console.log("  Stopping /pipeline-cleanup immediately to protect your work.");
    if (completedLoops > 0) {
        console.log(`  Completed ${completedLoops} cleanup loop${completedLoops === 1 ? "" : "s"} before stopping.`);
    }
    console.log("  Review `git status` / `git diff`, then re-run when ready.");
    console.log("═".repeat(60));
}

/**
 * Main command handler for `/pipeline-cleanup`.
 *
 * Enforces no-loop-in-progress and eligible-TODO pre-checks, then runs up to
 * MAX_CLEANUP_LOOPS complete pipeline loops starting from Interviewer (Role 01),
 * stopping cleanly when no eligible TODOs remain or immediately on mid-work
 * warnings, sub-agent errors, infinite-loop detection, or zero-progress loops.
 */
async function cleanupHandler(_args: string, ctx: ExtensionCommandContext): Promise<void> {
    if (_args.trim() === "--help" || _args.trim() === "-h") {
        printCleanupHelp();
        return;
    }

    if (_pipelineRunning) {
        console.log("");
        console.log("A pipeline run is already in progress. Wait for it to finish before starting /pipeline-cleanup.");
        return;
    }

    const cwd = ctx.cwd;

    // Guard: refuse to start if a loop is already active
    if (loopStateExists(cwd)) {
        console.log("");
        console.log("Cannot start /pipeline-cleanup — a pipeline loop is already in progress (ai_workspace/loop_state.md exists).");
        console.log("Finish or cancel the active loop first.");
        return;
    }

    // Startup eligible TODO pre-check (excludes TODO_manual_review_*.md)
    const initialTodos = listEligibleTodoFiles(cwd);
    if (initialTodos.length === 0) {
        console.log("");
        console.log("No eligible non-manual-review TODO files found in ai_workspace/TODO/. Nothing to clean up.");
        return;
    }

    _pipelineRunning = true;

    // Clear terminal (screen + scrollback) before runner banner (delayed to avoid TUI race)
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
            resolve();
        }, 100);
    });

    console.log("");
    console.log("═".repeat(60));
    console.log("  Auto-Cleanup Pipeline Runner");
    console.log(`  Max loops:    ${MAX_CLEANUP_LOOPS} (max ${MAX_SESSIONS} sessions/loop)`);
    console.log(`  Candidate TODOs: ${initialTodos.length}`);
    console.log(`  Working dir:  ${cwd}`);
    console.log("═".repeat(60));

    let completedLoops = 0;

    try {
        for (let loopNum = 1; loopNum <= MAX_CLEANUP_LOOPS; loopNum++) {
            // Re-verify no active loop exists before starting each cleanup loop
            if (loopStateExists(cwd)) {
                console.log("");
                console.log(`\u274C Unexpected active loop detected (ai_workspace/loop_state.md exists) before cleanup loop ${loopNum}. Stopping /pipeline-cleanup.`);
                _pipelineCompleted = true;
                return;
            }

            const beforeTodos = listEligibleTodoFiles(cwd);
            if (beforeTodos.length === 0) {
                console.log("");
                console.log(`\u2713 Cleanup complete — no eligible non-manual-review TODOs remain.`);
                console.log(`  Completed ${completedLoops} cleanup loop${completedLoops === 1 ? "" : "s"}. Type /new to continue to a new session.`);
                _pipelineCompleted = true;
                return;
            }

            console.log("");
            console.log("═".repeat(60));
            console.log(`  Cleanup Loop ${loopNum}/${MAX_CLEANUP_LOOPS} — ${beforeTodos.length} candidate TODO${beforeTodos.length === 1 ? "" : "s"}`);
            console.log(`── Session 1/${MAX_SESSIONS}`);
            console.log("═".repeat(60));
            console.log("");
            console.log("   Role: Interviewer (auto-cleanup inspection)");

            let interviewerResult: SubAgentResult;
            try {
                interviewerResult = await runSubAgent(cwd, {
                    systemPromptAppend: CLEANUP_AUTO_INSTRUCTIONS,
                    kickoffMessage: CLEANUP_INTERVIEWER_KICKOFF,
                });
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.log("");
                console.log(`  \u274C Cleanup stopped — Interviewer sub-agent error: ${msg}`);
                _pipelineCompleted = true;
                return;
            }

            if (!_pipelineRunning) return;

            if (!interviewerResult.ok) {
                console.log("");
                console.log(`  \u274C Cleanup stopped — Interviewer failed: ${interviewerResult.error ?? "unknown error"}`);
                _pipelineCompleted = true;
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, FS_FLUSH_DELAY_MS));

            if (interviewerResult.stopSignal === "mid_work") {
                printMidWorkWarning(completedLoops);
                _pipelineCompleted = true;
                return;
            }

            // If Interviewer exited without creating loop_state.md, stop cleanly (no eligible TODOs)
            if (!loopStateExists(cwd)) {
                console.log("");
                if (interviewerResult.stopSignal === "no_eligible_todos") {
                    console.log("\u2713 Cleanup complete — Interviewer determined no remaining TODOs can be completed without user input.");
                } else {
                    console.log("\u2713 Cleanup complete — Interviewer exited without starting a new loop.");
                }
                console.log(`  Completed ${completedLoops} cleanup loop${completedLoops === 1 ? "" : "s"}. Type /new to continue to a new session.`);
                _pipelineCompleted = true;
                return;
            }

            // Inner role loop for the current cleanup loop (Planner → Finalizer)
            const roleHistory: string[] = ["Interviewer"];
            let loopFinished = false;

            for (let sessionNum = 2; sessionNum <= MAX_SESSIONS; sessionNum++) {
                const role = getCurrentRole(cwd);

                console.log("");
                console.log(`── Loop ${loopNum}/${MAX_CLEANUP_LOOPS} | Session ${sessionNum}/${MAX_SESSIONS}`);
                console.log("═".repeat(60));
                console.log("");
                console.log(`   Role: ${role ?? "(unknown — loop_state.md may be stale)"}`);

                // Infinite-loop detection: same role repeated STUCK_THRESHOLD+ times halts entire cleanup
                if (role && roleHistory.length >= STUCK_THRESHOLD - 1) {
                    const recent = [...roleHistory.slice(-(STUCK_THRESHOLD - 1)), role];
                    if (recent.every((r) => r === role)) {
                        console.log("");
                        console.log("\u26A0 WARNING: Possible infinite loop detected!");
                        console.log(`  "${role}" has run ${STUCK_THRESHOLD}+ times consecutively.`);
                        console.log("  Stopping /pipeline-cleanup immediately. Check your role files and transition_guide.");
                        _pipelineCompleted = true;
                        return;
                    }
                }

                if (role) {
                    roleHistory.push(role);
                    if (roleHistory.length > STUCK_THRESHOLD * 2) {
                        roleHistory.splice(0, roleHistory.length - STUCK_THRESHOLD);
                    }
                }

                const kickoffMessage = role === "Interviewer" ? CLEANUP_INTERVIEWER_KICKOFF : CLEANUP_LOOP_KICKOFF;
                let sessionResult: SubAgentResult;
                try {
                    sessionResult = await runSubAgent(cwd, {
                        systemPromptAppend: CLEANUP_AUTO_INSTRUCTIONS,
                        kickoffMessage,
                    });
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.log("");
                    console.log(`  \u274C Cleanup stopped — sub-agent error: ${msg}`);
                    _pipelineCompleted = true;
                    return;
                }

                if (!_pipelineRunning) return;

                if (!sessionResult.ok) {
                    console.log("");
                    console.log(`  \u274C Cleanup stopped — sub-agent failed: ${sessionResult.error ?? "unknown error"}`);
                    _pipelineCompleted = true;
                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, FS_FLUSH_DELAY_MS));

                // Only the Interviewer performs the git mid-work inspection, so only its mid_work
                // signal is actionable here. Downstream roles may quote the sentinel in prose
                // (e.g., while summarizing code changes) and must not abort the cleanup run.
                if (sessionResult.stopSignal === "mid_work" && role === "Interviewer") {
                    printMidWorkWarning(completedLoops);
                    _pipelineCompleted = true;
                    return;
                }

                if (!loopStateExists(cwd)) {
                    completedLoops++;
                    loopFinished = true;
                    console.log("");
                    console.log(`\u2713 Cleanup loop ${loopNum} complete — loop_state.md removed by Finalizer (${sessionNum} sessions).`);
                    break;
                }
            }

            if (!loopFinished) {
                console.log("");
                console.log(`\u274C Max sessions (${MAX_SESSIONS}) reached in cleanup loop ${loopNum} — loop_state.md still exists.`);
                console.log("  Stopping /pipeline-cleanup immediately. Check for infinite loops.");
                _pipelineCompleted = true;
                return;
            }

            // No-progress safeguard: verify at least one pre-loop eligible TODO was resolved/deleted
            const afterTodos = listEligibleTodoFiles(cwd);
            if (afterTodos.length > 0 && beforeTodos.every((f) => afterTodos.includes(f))) {
                console.log("");
                console.log("\u26A0 WARNING: Cleanup loop completed with zero progress on eligible TODO files.");
                console.log(`  All ${beforeTodos.length} pre-loop eligible TODO file(s) are still present on disk.`);
                console.log(`  Stopping /pipeline-cleanup after ${completedLoops} completed loop${completedLoops === 1 ? "" : "s"} to avoid spinning.`);
                _pipelineCompleted = true;
                return;
            }
        }
    } finally {
        _pipelineRunning = false;
    }

    // Fell out of the loop: either all eligible TODOs were resolved (clean completion) or the
    // hard cap of MAX_CLEANUP_LOOPS was hit with candidates still remaining.
    const remainingTodos = listEligibleTodoFiles(cwd);
    _pipelineCompleted = true;
    console.log("");
    if (remainingTodos.length === 0) {
        console.log(`\u2713 Cleanup complete — no eligible non-manual-review TODOs remain.`);
        console.log(`  Completed ${completedLoops} cleanup loop${completedLoops === 1 ? "" : "s"}. Type /new to continue to a new session.`);
    } else {
        console.log(`\u26A0 Max cleanup loops (${MAX_CLEANUP_LOOPS}) reached. Stopping /pipeline-cleanup.`);
        console.log(`  Completed ${completedLoops} cleanup loops; ${remainingTodos.length} candidate TODO file${remainingTodos.length === 1 ? "" : "s"} still remain.`);
    }
}

/**
 * Extension registration — the default export that pi calls to load this extension.
 *
 * Registers the `/pipeline-auto` and `/pipeline-cleanup` commands and sets up event listeners:
 * - `input`: forwards plain TUI text to active sub-agent for live steering
 * - `session_start`: captures initial role/goal summary, clears screen on /new after completion
 * - `turn_end`: updates footer status with current role + goal summary
 * - `agent_end`: final checkpoint — catches post-Finalizer loop_state.md deletion
 * - `session_shutdown`: clears footer status on session replacement (/new, /resume, /fork)
 */
export default function (pi: ExtensionAPI) {
    pi.registerCommand("pipeline-auto", {
        description: "Run the role pipeline autonomously via sequential sub-agent sessions",
        handler,
    });

    pi.registerCommand("pipeline-cleanup", {
        description: "Autonomously drain eligible non-manual-review TODOs across sequential cleanup loops",
        handler: cleanupHandler,
    });



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
