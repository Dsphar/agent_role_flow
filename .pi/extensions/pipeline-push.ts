/**
 * Pipeline-Push Extension — Sequential sub-agent pipeline runner with auto-loop monitoring
 *
 * Spawns pi subprocesses in a loop. Each subprocess receives "hi" as its
 * initial prompt and operates autonomously under the project's AGENTS.md
 * workflow (roles, loop_state.md, transition_guide). The extension is
 * completely generic — it never references role names or counts. It only:
 *   1. Reads loop_state.md to display current status and detect infinite loops.
 *   2. Checks whether loop_state.md still exists after each run (Finalizer deletes it).
 *   3. Monitors can_loop flag on turn_end events and shows proactive footer status.
 *
 * Usage: /pipeline-push          — start the pipeline
 *        /pipeline-push --help   — show help text
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

const MAX_SESSIONS = 50;
const LOOP_STATE_FILE = "ai_workspace/loop_state.md";
const STUCK_THRESHOLD = 3; // warn after this many consecutive same-role runs

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
 * Spawn a single pi subprocess in print mode with "hi" as the initial prompt.
 * Output is inherited so the user sees everything in real-time.
 */
function runSubAgent(cwd: string): number {
    const { command, args: baseArgs } = getPiCommand();

    // Print mode (-p), no session file (each sub-agent gets ephemeral context).
    // AGENTS.md is still loaded from the project directory for workflow instructions.
    // --append-system-prompt injects auto-accept rules so roles never block on user input.
    const childArgs = [
        ...baseArgs,
        "-p",
        "--no-session",
        "--append-system-prompt", AUTO_ACCEPT_INSTRUCTIONS.trim(),
        "Hello. I will be stepping away from the computer. Please load the loop_state.md file and perform your tasks without me. Please automatically select your recommendations (do not prompt me for decisions) and continue working without me.",
    ];

    console.log("");
    spawnSync(command, childArgs, {
        cwd,
        stdio: "inherit",
        shell: false,
        maxBuffer: 50 * 1024 * 1024, // 50 MB — generous for long agent runs
    });

    return 0;
}

function printHelp(): void {
    console.log(`
Pipeline-Push — Sequential sub-agent pipeline runner with auto-loop monitoring

Spawns pi subprocesses in a loop. Each receives "hi" and follows the project's
AGENTS.md workflow (roles, loop_state.md, transitions). The extension is role-agnostic:
it never hardcodes role names or counts.

Options:
  /pipeline-push              Start the pipeline (max ${MAX_SESSIONS} sessions)
  /pipeline-push --help       Show this help text

Safety features:
  - Max ${MAX_SESSIONS} sequential sessions (hard stop)
  - Infinite-loop detection: warns if same role repeats ${STUCK_THRESHOLD}+ times
  - Pipeline ends when Finalizer deletes loop_state.md
  - can_loop guard: command exits early if can_loop is not yet enabled by the Planner

Monitoring:
  Current role is printed before each session. Sub-agent output streams live.
  On turn_end, footer status shows whether auto-looping is available.`);
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
                console.log("⚠ WARNING: Possible infinite loop detected!");
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

        // Run the sub-agent session
        runSubAgent(cwd);

        // Brief pause to let filesystem flush loop_state.md writes
        // (Finalizer may delete it; we need to see that on next check)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Check if pipeline is complete (loop_state.md deleted by Finalizer)
        if (!loopStateExists(cwd)) {
            console.log("");
            console.log("✓ Pipeline complete — loop_state.md removed by Finalizer.");
            console.log(`  Finished in ${i} session${i > 1 ? "s" : ""}.`);
            return;
        }
    }

    // Safety cutoff reached
    console.log("");
    console.log(`⚠ Max sessions (${MAX_SESSIONS}) reached. Stopping.`);
    console.log("  If the pipeline should still be running, check for infinite loops.");
}

export default function (pi: ExtensionAPI) {
    pi.registerCommand("pipeline-push", {
        description: "Run the role pipeline autonomously via sequential sub-agent sessions",
        handler,
    });

    // Proactive monitoring: check can_loop and show footer status
    const updateStatus = (ctx) => {
        if (!ctx.hasUI) return; // no-op in print mode (sub-agent sessions)
        if (parseCanLoop(ctx.cwd)) {
            ctx.ui.setStatus("pipeline-push", "Auto-work is available. Run /pipeline-push to start.");
        } else {
            ctx.ui.setStatus("pipeline-push", "");
        }
    };

    // On session start so footer appears when pi loads
    pi.on("session_start", (_event, ctx) => updateStatus(ctx));
    // On each turn end to pick up changes mid-session
    pi.on("turn_end", (_event, ctx) => updateStatus(ctx));
}
