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
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

const MAX_SESSIONS = 50;
const LOOP_STATE_FILE = "ai_workspace/loop_state.md";
const STUCK_THRESHOLD = 3; // warn after this many consecutive same-role runs

// Track whether pipeline-auto has completed a run in this extension lifecycle.
// Used to clear previous output when user types /new after the pipeline finishes.
let _pipelineCompleted = false;

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
 * Parse line 2 of loop_state.md to extract the current role name.
 * Expected format: **Current Role:** {RoleName} (Role NN) | History: ...
 */
function getCurrentRole(cwd: string): string | undefined {
    try {
        const content = fs.readFileSync(path.join(cwd, LOOP_STATE_FILE), "utf-8");
        const lines = content.split("\n");
        if (lines.length < 2) return undefined;

        // Strip trailing <br> for parsing
        let line2 = lines[1].replace(/<br>\s*$/, "");
        const match = line2.match(/\*\*Current Role:\*\*\s*(.+?)(?:\s+(?:\(in-sendback\)\s+)?\(Role\s+\d+\)|\s+\|)/i);
        return match ? match[1].trim() : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Parse line 3 of loop_state.md to extract the can_loop flag.
 * Expected format: test_level=... | skip_docs=... | can_loop={true|false}
 * Returns false if file missing, key absent, or value unrecognized.
 */
function parseCanLoop(cwd: string): boolean {
    try {
        const content = fs.readFileSync(path.join(cwd, LOOP_STATE_FILE), "utf-8");
        const lines = content.split("\n");
        if (lines.length < 3) return false;

        // Strip trailing <br> for parsing
        let line3 = lines[2].replace(/<br>\s*$/, "");
        const pairs = line3.split(" | ");
        for (const pair of pairs) {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1) continue;
            const key = pair.substring(0, eqIdx).trim();
            const value = pair.substring(eqIdx + 1).trim();
            if (key === "can_loop" && (value === "true" || value === "false")) {
                return value === "true";
            }
        }
        return false; // key absent
    } catch {
        return false; // file missing or read error
    }
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

        const decoder = new StringDecoder("utf-8");
        let jsonBuffer = ""; // raw JSONL from stdout
        let textBuffer = ""; // accumulated text_delta content, flushed line-by-line
        let agentEnded = false;
        let resolved = false; // guard against double-resolution

        const pendingTools: Array<{ name: string; status: "pending" | "success" | "error" }> = [];

        /** Flush buffered text line-by-line, keeping the last incomplete segment. */
        function flushBufferedLines(): void {
            const lines = textBuffer.split("\n");
            // Keep the last (possibly incomplete) segment in the buffer
            for (let i = 0; i < lines.length - 1; i++) {
                console.log(lines[i]);
            }
            textBuffer = lines[lines.length - 1];
        }

        /** Flush all buffered text including pending tool call results. */
        function flushAllBufferedText(): void {
            // Print any pending tool call results inline (not as standalone lines)
            if (pendingTools.length > 0) {
                for (const tool of pendingTools) {
                    const emoji = tool.status === "error" ? "\u274C" : "\u2705";
                    console.log(`  \u{1F9F0} ${tool.name} ${emoji}`);
                }
                pendingTools.length = 0;
            }
            if (textBuffer) {
                console.log(textBuffer);
                textBuffer = "";
            }
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
                        const name = event.toolName as string | undefined;
                        if (name) {
                            pendingTools.push({ name, status: "pending" });
                        }
                        break;
                    case "toolcall_end":
                        // Mark the last pending tool with its result status
                        const isError = event.isError as boolean | undefined;
                        if (pendingTools.length > 0) {
                            pendingTools[pendingTools.length - 1].status = isError ? "error" : "success";
                        }
                        break;
                    // thinking_delta, text_start, text_end, etc. — silently handled
                }
                return;
            }

            if (type === "compaction_start") {
                flushAllBufferedText();
                console.log("");
                console.log("  \u{1F504} Compacting context...");
                return;
            }

            // Agent events — flush buffered text, close stdin to trigger process exit
            if (type === "agent_end") {
                flushAllBufferedText();
                agentEnded = true;
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
            resolve();
        }

        // Resolve when process exits (triggered by stdin.end after agent_end)
        child.on("exit", (code, signal) => {
            if (!agentEnded && code !== 0) {
                console.log("");
                console.log(`  \u26A0 Sub-agent exited with code ${code}${signal ? ` / ${signal}` : ""}.`);
            }
            safeResolve();
        });

        child.on("error", (err) => {
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
  Tool calls are shown inline. Extension UI dialogs are auto-accepted.`);
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
            console.log(`  Finished in ${i} session${i > 1 ? "s" : ""}.`);
            _pipelineCompleted = true;
            return;
        }
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

    // Proactive monitoring: check can_loop and show footer status
    const updateStatus = (ctx: unknown) => {
        const c = ctx as { hasUI?: boolean; cwd?: string; ui?: { setStatus: (key: string, text: string | undefined) => void } };
        if (!c?.hasUI || !c?.cwd || !c?.ui) return; // no-op in print mode (sub-agent sessions)
        if (parseCanLoop(c.cwd)) {
            c.ui.setStatus("pipeline-auto", "Auto-work is available. Run /pipeline-auto to start.");
        } else {
            c.ui.setStatus("pipeline-auto", "");
        }
    };

    // On session start: update footer status and clear previous pipeline output on /new.
    // When user types /new after the auto-loop completes, this clears the terminal
    // so previous extension console.log output doesn't remain on screen.
    pi.on("session_start", (event, ctx) => {
        updateStatus(ctx);
        const e = event as { reason?: string };
        if (e.reason === "new" && _pipelineCompleted) {
            process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
            _pipelineCompleted = false;
        }
    });
    // On each turn end to pick up changes mid-session
    pi.on("turn_end", (_event, ctx) => updateStatus(ctx));
    // Clear footer status on session replacement (/new, /resume, /fork)
    pi.on("session_shutdown", (_event, ctx) => {
        const c = ctx as { hasUI?: boolean; ui?: { setStatus: (key: string, text: string | undefined) => void } };
        if (!c?.hasUI || !c?.ui) return;
        c.ui.setStatus("pipeline-auto", undefined);
    });
}
