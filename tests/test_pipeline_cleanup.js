/**
 * Deep unit, static-guard, and fake-RPC integration tests for:
 *  1. Finalizer loop_state.md append conflict fix (ai_workspace/roles/07_finalizer.md)
 *  2. Auto-cleanup guidance in Interviewer & Planner role files (01_interviewer.md, 02_planner.md)
 *  3. /pipeline-cleanup command in .pi/extensions/pipeline-auto.ts
 *
 * Dual-mode script (mirrors test_pipeline_auto_features.js):
 *  - When spawned with `--mode rpc`, acts as a fake pi RPC sub-agent driven by TEST_CLEANUP_SCENARIO.
 *  - When run directly via `node tests/test_pipeline_cleanup.js`, executes all assertions in an isolated temp dir.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.join(__dirname, "..");

// -----------------------------------------------------------------------------
// FAKE RPC CHILD PROCESS (when spawned by pipeline-auto.ts)
// -----------------------------------------------------------------------------
if (process.argv.includes("--mode") && process.argv.includes("rpc")) {
    const scenario = process.env.TEST_CLEANUP_SCENARIO || "";
    const tmpdir = process.env.TEST_TMPDIR;
    const loopStatePath = path.join(tmpdir, "ai_workspace", "loop_state.md");
    const todoDir = path.join(tmpdir, "ai_workspace", "TODO");
    const counterPath = path.join(tmpdir, "session_counter.txt");
    const spawnLogPath = path.join(tmpdir, "spawn_log.jsonl");

    function sendJson(obj) {
        process.stdout.write(JSON.stringify(obj) + "\n");
    }

    function nextCount() {
        let count = 0;
        try {
            count = parseInt(fs.readFileSync(counterPath, "utf8").trim(), 10) || 0;
        } catch {}
        count += 1;
        fs.writeFileSync(counterPath, String(count), "utf8");
        return count;
    }

    function writeLoopState(roleLine, canLoop = true) {
        fs.mkdirSync(path.dirname(loopStatePath), { recursive: true });
        fs.writeFileSync(
            loopStatePath,
            [
                "**Goal Summary:** Auto cleanup test<br>",
                `**Current Role:** ${roleLine}<br>`,
                `**Pipeline Config:** test_level=quick | do_docs=false | can_loop=${canLoop}<br>`,
                "",
            ].join("\n"),
            "utf8",
        );
    }

    function deleteLoopState() {
        try { fs.unlinkSync(loopStatePath); } catch {}
    }

    function getSystemPromptArg() {
        const idx = process.argv.indexOf("--append-system-prompt");
        return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : "";
    }

    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    let steerReceived = false;

    rl.on("line", (line) => {
        if (!line.trim()) return;
        const req = JSON.parse(line);

        if (req.id === "kickoff") {
            const count = nextCount();
            fs.appendFileSync(
                spawnLogPath,
                JSON.stringify({
                    count,
                    systemPrompt: getSystemPromptArg(),
                    kickoffMessage: req.message,
                }) + "\n",
                "utf8",
            );
            runScenario(scenario, count);
        } else if (req.id && req.id.startsWith("steer-")) {
            steerReceived = true;
            process.stderr.write(`[CLEANUP_CHILD_STEER] ${req.message}\n`);
            sendJson({ type: "response", command: "prompt", id: req.id, success: true });
        } else if (req.id === "wind-down") {
            process.stderr.write(`[CLEANUP_CHILD_WIND_DOWN]\n`);
            sendJson({ type: "response", command: "prompt", id: req.id, success: true });
            sendJson({ type: "agent_end" });
        } else if (req.type === "get_session_stats") {
            let tokens = 1000;
            const window = 32000;
            if (scenario === "STEERING_AND_WINDDOWN") {
                const count = parseInt(fs.readFileSync(counterPath, "utf8").trim(), 10) || 1;
                if (count === 2) {
                    tokens = 25000; // 7k remaining -> triggers <15k wind-down
                }
            }
            sendJson({
                type: "response",
                command: "get_session_stats",
                data: { contextUsage: { tokens, contextWindow: window, percent: (tokens / window) * 100 } },
            });
        }
    });

    function runScenario(sc, count) {
        if (sc === "NO_ELIGIBLE_SENTINEL") {
            sendJson({
                type: "message_update",
                assistantMessageEvent: {
                    type: "text_delta",
                    delta: "Remaining TODO requires user design choice.\n[CLEANUP_STOP: NO_ELIGIBLE_TODOS]\n",
                },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "NO_ELIGIBLE_NO_SENTINEL") {
            sendJson({
                type: "message_update",
                assistantMessageEvent: {
                    type: "text_delta",
                    delta: "Skipping remaining ambiguous TODOs.\n",
                },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "MID_WORK_SENTINEL") {
            // Split sentinel across chunks AND emit NO_ELIGIBLE_TODOS afterward to verify mid_work precedence
            sendJson({
                type: "message_update",
                assistantMessageEvent: { type: "text_delta", delta: "Found WIP edits in src/app.ts.\n[CLEANUP_STOP: MID_" },
            });
            sendJson({
                type: "message_update",
                assistantMessageEvent: { type: "text_delta", delta: "WORK_CHANGES]\n[CLEANUP_STOP: NO_ELIGIBLE_TODOS]\n" },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "MULTI_LOOP_HAPPY") {
            if (count === 1) {
                writeLoopState("Planner (Role 02) | History: Interviewer", false);
            } else if (count === 2) {
                writeLoopState("Worker (Role 03) | History: Interviewer → Planner", true);
            } else if (count === 3) {
                try { fs.unlinkSync(path.join(todoDir, "TODO_P2_alpha.md")); } catch {}
                writeLoopState("Finalizer (Role 07) | History: Interviewer → Planner → Worker", true);
            } else if (count === 4) {
                deleteLoopState();
            } else if (count === 5) {
                writeLoopState("Finalizer (Role 07) | History: Interviewer", true);
            } else if (count === 6) {
                try { fs.unlinkSync(path.join(todoDir, "TODO_P3_beta.md")); } catch {}
                deleteLoopState();
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "NONZERO_EXIT") {
            process.exit(1);
        } else if (sc === "REJECTED_KICKOFF") {
            sendJson({
                type: "response",
                command: "prompt",
                id: "kickoff",
                success: false,
                error: "Simulated provider failure",
            });
        } else if (sc === "STUCK_ROLE") {
            if (count === 1) {
                writeLoopState("Worker (Role 03) | History: Interviewer", true);
            }
            // Sessions 2 & 3 leave Worker unchanged in loop_state.md -> triggers stuck guard before session 4
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "NO_PROGRESS") {
            if (count === 1) {
                writeLoopState("Finalizer (Role 07) | History: Interviewer", true);
            } else if (count === 2) {
                // Deletes loop_state.md without deleting TODO_P2_stuck.md
                deleteLoopState();
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "PROGRESS_WITH_NEW_TODO") {
            if (count === 1) {
                writeLoopState("Finalizer (Role 07) | History: Interviewer", true);
            } else if (count === 2) {
                // Deletes old TODO, creates a new out-of-scope TODO, and finishes loop
                try { fs.unlinkSync(path.join(todoDir, "TODO_P2_old.md")); } catch {}
                fs.writeFileSync(path.join(todoDir, "TODO_P3_newly_discovered.md"), "# New TODO\n", "utf8");
                deleteLoopState();
            } else if (count === 3) {
                // Loop 2 Interviewer inspects newly created TODO and rejects it cleanly
                sendJson({
                    type: "message_update",
                    assistantMessageEvent: { type: "text_delta", delta: "[CLEANUP_STOP: NO_ELIGIBLE_TODOS]\n" },
                });
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "CAP_20_LOOPS") {
            if (count % 2 === 1) {
                writeLoopState("Finalizer (Role 07) | History: Interviewer", true);
            } else {
                const files = fs.readdirSync(todoDir)
                    .filter((f) => f.endsWith(".md") && !f.toLowerCase().startsWith("todo_manual_review_"))
                    .sort();
                if (files.length > 0) {
                    try { fs.unlinkSync(path.join(todoDir, files[0])); } catch {}
                }
                deleteLoopState();
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 5);
        } else if (sc === "STEERING_AND_WINDDOWN") {
            if (count === 1) {
                sendJson({
                    type: "message_update",
                    assistantMessageEvent: { type: "text_delta", delta: "Interviewer inspecting TODOs...\n" },
                });
                // Wait briefly for parent to send live steering message
                setTimeout(() => {
                    writeLoopState("Worker (Role 03) | History: Interviewer", true);
                    sendJson({ type: "agent_end" });
                }, 150);
            } else if (count === 2) {
                // Worker emits text to trigger stats poll -> low context -> wind-down ends session
                sendJson({
                    type: "message_update",
                    assistantMessageEvent: { type: "text_delta", delta: "Worker running low on context...\n" },
                });
            } else if (count === 3) {
                // Fresh resumed Worker completes work and Finalizer removes loop_state
                try { fs.unlinkSync(path.join(todoDir, "TODO_P2_steer_test.md")); } catch {}
                deleteLoopState();
                setTimeout(() => sendJson({ type: "agent_end" }), 10);
            }
        } else if (sc === "REENTRANCY") {
            sendJson({
                type: "message_update",
                assistantMessageEvent: { type: "text_delta", delta: "Working...\n" },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 200);
        } else if (sc === "PROSE_NO_ELIGIBLE") {
            // Sentinel appears only as a substring of prose — must NOT set stopSignal
            sendJson({
                type: "message_update",
                assistantMessageEvent: {
                    type: "text_delta",
                    delta: "Note: the [CLEANUP_STOP: NO_ELIGIBLE_TODOS] sentinel is documented in pipeline-auto.ts.\nRemaining TODOs need user input, so I am stopping here without starting a loop.\n",
                },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "BACKTICK_MID_WORK") {
            // Sentinel wrapped in backticks on its own line — normalization must still match
            sendJson({
                type: "message_update",
                assistantMessageEvent: {
                    type: "text_delta",
                    delta: "Found WIP edits in src/app.ts.\n`[CLEANUP_STOP: MID_WORK_CHANGES]`\n",
                },
            });
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "PROSE_MID_WORK_LOOP") {
            // Prose mentions the mid-work sentinel, but Interviewer starts a loop anyway —
            // exact-line matching must not abort the run with a false-positive warning.
            if (count === 1) {
                sendJson({
                    type: "message_update",
                    assistantMessageEvent: {
                        type: "text_delta",
                        delta: "Docs review: the [CLEANUP_STOP: MID_WORK_CHANGES] guard is defined in pipeline-auto.ts.\nStarting cleanup loop for TODO_P2_item.md.\n",
                    },
                });
                writeLoopState("Planner (Role 02) | History: Interviewer", false);
            } else if (count === 2) {
                try { fs.unlinkSync(path.join(todoDir, "TODO_P2_item.md")); } catch {}
                deleteLoopState();
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "DOWNSTREAM_SENTINEL") {
            // Planner quotes the mid-work sentinel as its own line while summarizing code —
            // only Interviewer's mid_work signal may halt the inner loop.
            if (count === 1) {
                writeLoopState("Planner (Role 02) | History: Interviewer", false);
            } else if (count === 2) {
                sendJson({
                    type: "message_update",
                    assistantMessageEvent: {
                        type: "text_delta",
                        delta: "Plan summary note: [CLEANUP_STOP: MID_WORK_CHANGES]\nHanding off to Worker.\n",
                    },
                });
                writeLoopState("Worker (Role 03) | History: Interviewer → Planner", true);
            } else if (count === 3) {
                try { fs.unlinkSync(path.join(todoDir, "TODO_P2_item.md")); } catch {}
                deleteLoopState();
            }
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        } else if (sc === "SILENT_ZERO_EXIT") {
            // Exits with code 0 before emitting agent_end — must resolve ok:false and halt
            process.exit(0);
        } else {
            setTimeout(() => sendJson({ type: "agent_end" }), 10);
        }
    }

    process.stdin.on("end", () => process.exit(0));
    return;
}

// -----------------------------------------------------------------------------
// TEST RUNNER
// -----------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✓ ${testName}`);
        passed++;
    } else {
        console.log(`  ✗ FAIL: ${testName}`);
        failed++;
    }
}

const capturedLogs = [];
const originalConsoleLog = console.log;
const originalStdoutWrite = process.stdout.write;
let stdoutBuffer = "";

function overrideOutput() {
    console.log = function (...args) {
        if (stdoutBuffer) {
            capturedLogs.push(stdoutBuffer);
            stdoutBuffer = "";
        }
        capturedLogs.push(args.join(" "));
    };
    process.stdout.write = function (chunk) {
        const str = chunk.toString();
        if (str === "\n") {
            if (stdoutBuffer) {
                capturedLogs.push(stdoutBuffer);
                stdoutBuffer = "";
            }
        } else {
            stdoutBuffer += str;
        }
        return true;
    };
}

function restoreOutput() {
    if (stdoutBuffer) {
        capturedLogs.push(stdoutBuffer);
        stdoutBuffer = "";
    }
    console.log = originalConsoleLog;
    process.stdout.write = originalStdoutWrite;
}

function clearLogs() {
    capturedLogs.length = 0;
    stdoutBuffer = "";
}

/**
 * Accelerate long flush delays (>= 1000ms) inside the parent test runner while
 * preserving short timers (like 10-200ms steering/clear timers) so multi-loop
 * integration tests run quickly with real subprocesses and real disk I/O.
 */
async function withFastFlushDelay(fn) {
    const origSetTimeout = globalThis.setTimeout;
    globalThis.setTimeout = (cb, ms, ...args) => {
        const adjusted = typeof ms === "number" && ms >= 1000 ? 15 : ms;
        return origSetTimeout(cb, adjusted, ...args);
    };
    try {
        return await fn();
    } finally {
        globalThis.setTimeout = origSetTimeout;
    }
}

function makeTempWorkspace() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pipeline_cleanup_test_"));
    fs.mkdirSync(path.join(dir, "ai_workspace", "TODO"), { recursive: true });
    return dir;
}

function readSpawnLog(dir) {
    const logPath = path.join(dir, "spawn_log.jsonl");
    if (!fs.existsSync(logPath)) return [];
    return fs.readFileSync(logPath, "utf8")
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => JSON.parse(l));
}

async function runTests() {
    console.log("\n=== test_pipeline_cleanup.js ===");

    // -------------------------------------------------------------------------
    // SECTION 1: Role skill file static analysis
    // -------------------------------------------------------------------------
    console.log("\n--- Section 1: Role skill file static guards ---");

    const finalizer = fs.readFileSync(path.join(ROOT, "ai_workspace", "roles", "07_finalizer.md"), "utf8");
    const interviewer = fs.readFileSync(path.join(ROOT, "ai_workspace", "roles", "01_interviewer.md"), "utf8");
    const planner = fs.readFileSync(path.join(ROOT, "ai_workspace", "roles", "02_planner.md"), "utf8");
    const transitionGuide = fs.readFileSync(path.join(ROOT, "ai_workspace", "skill_helpers", "transition_guide.md"), "utf8");

    // 07_finalizer.md
    assert(
        finalizer.includes("Do **not** append a summary to `ai_workspace/loop_state.md`"),
        "07_finalizer.md Deliverables explicitly prohibits appending summary to loop_state.md",
    );
    assert(
        finalizer.includes("do **not** update line 2 (handoff history)"),
        "07_finalizer.md Deliverables explicitly prohibits updating handoff line 2",
    );
    assert(
        finalizer.includes("do **not** follow `transition_guide.md` for summary/handoff commits"),
        "07_finalizer.md Deliverables explicitly overrides transition_guide.md summary/handoff flow",
    );
    assert(
        finalizer.includes("Follow `### Loop Reset and Handoff` above instead"),
        "07_finalizer.md Deliverables points directly to Loop Reset and Handoff",
    );
    assert(
        finalizer.includes("**Do not append a summary to `loop_state.md` or update its handoff line (line 2).**"),
        "07_finalizer.md What You Must Not Do includes matching prohibition",
    );
    assert(
        finalizer.includes("Remove `ai_workspace/loop_state.md`") && finalizer.includes("[ai-pipeline]"),
        "07_finalizer.md preserves Loop Reset and Handoff deletion and [ai-pipeline] squash commit",
    );
    assert(
        !transitionGuide.includes("Finalizer"),
        "transition_guide.md remains untouched with no Finalizer-specific carve-outs",
    );

    // 01_interviewer.md
    assert(
        interviewer.includes("### Auto-Cleanup Mode (Only When Invoked by /pipeline-cleanup)"),
        "01_interviewer.md contains scoped Auto-Cleanup Mode subsection",
    );
    assert(
        interviewer.includes("Normal human-driven sessions remain strictly interactive and unchanged."),
        "01_interviewer.md preserves normal interactive session behavior",
    );
    assert(
        interviewer.includes("Strictly ignore all `TODO_manual_review_*.md` files"),
        "01_interviewer.md strictly excludes TODO_manual_review_*.md files in auto-cleanup mode",
    );
    assert(
        interviewer.includes("[CLEANUP_STOP: MID_WORK_CHANGES]"),
        "01_interviewer.md defines exact MID_WORK_CHANGES sentinel",
    );
    assert(
        interviewer.includes("[CLEANUP_STOP: NO_ELIGIBLE_TODOS]"),
        "01_interviewer.md defines exact NO_ELIGIBLE_TODOS sentinel",
    );
    assert(
        interviewer.includes("Batching multiple eligible TODOs into one loop is allowed"),
        "01_interviewer.md permits sensible batching of eligible TODOs",
    );
    assert(
        interviewer.includes("Select `test_level` and `do_docs` using your runtime recommendations, set `can_loop=false`"),
        "01_interviewer.md uses runtime config recommendations with can_loop=false",
    );

    // 02_planner.md
    assert(
        planner.includes("### Auto-Cleanup Mode (Only When Invoked by /pipeline-cleanup)"),
        "02_planner.md contains scoped Auto-Cleanup Mode subsection",
    );
    assert(
        planner.includes("Normal human-driven sessions remain strictly interactive (Phase 1 questioning and manual console approval remain mandatory)."),
        "02_planner.md preserves strict interactivity for normal sessions",
    );
    assert(
        planner.includes("Auto-approved (pipeline-cleanup mode)"),
        "02_planner.md specifies auto-approved status string in auto-cleanup mode",
    );
    assert(
        planner.includes("mandatory Worker TODO-deletion steps") && planner.includes("mandatory test-creation deferral to Tester"),
        "02_planner.md preserves TODO-deletion and test-creation deferral mandates in auto-cleanup mode",
    );
    assert(
        planner.includes("Do not write the plan to `loop_state.md` before user approval** (exception: when explicitly invoked in `/pipeline-cleanup` auto-cleanup mode"),
        "02_planner.md hard constraint bullet includes explicit /pipeline-cleanup exception",
    );

    // -------------------------------------------------------------------------
    // SECTION 2: Unit tests — exports, constants, registration, listEligibleTodoFiles
    // -------------------------------------------------------------------------
    console.log("\n--- Section 2: Unit tests (exports, constants, listEligibleTodoFiles) ---");

    const ext = await import("../.pi/extensions/pipeline-auto.ts");

    assert(ext.MAX_CLEANUP_LOOPS === 20, "MAX_CLEANUP_LOOPS exported as 20");
    assert(
        ext.CLEANUP_STOP_MID_WORK === "[CLEANUP_STOP: MID_WORK_CHANGES]",
        "CLEANUP_STOP_MID_WORK sentinel matches expected string",
    );
    assert(
        ext.CLEANUP_STOP_NO_TODOS === "[CLEANUP_STOP: NO_ELIGIBLE_TODOS]",
        "CLEANUP_STOP_NO_TODOS sentinel matches expected string",
    );
    assert(typeof ext.listEligibleTodoFiles === "function", "listEligibleTodoFiles is exported as a function");

    const commands = {};
    const events = {};
    const mockPi = {
        registerCommand: (name, config) => { commands[name] = config; },
        on: (name, handler) => { events[name] = handler; },
    };
    ext.default(mockPi);

    assert(Boolean(commands["pipeline-auto"]), "Registers pipeline-auto command");
    assert(Boolean(commands["pipeline-cleanup"]), "Registers pipeline-cleanup command");
    assert(typeof commands["pipeline-cleanup"].handler === "function", "pipeline-cleanup has handler function");

    // Unit-test listEligibleTodoFiles() across edge cases
    const unitTmp = fs.mkdtempSync(path.join(os.tmpdir(), "todo_scanner_unit_"));
    try {
        // Missing ai_workspace/TODO directory
        assert(
            ext.listEligibleTodoFiles(unitTmp).length === 0,
            "listEligibleTodoFiles returns [] when TODO directory does not exist",
        );

        // Empty TODO directory
        const unitTodoDir = path.join(unitTmp, "ai_workspace", "TODO");
        fs.mkdirSync(unitTodoDir, { recursive: true });
        assert(
            ext.listEligibleTodoFiles(unitTmp).length === 0,
            "listEligibleTodoFiles returns [] when TODO directory is empty",
        );

        // Manual-review-only files (including case variations)
        fs.writeFileSync(path.join(unitTodoDir, "TODO_manual_review_alpha.md"), "# manual\n");
        fs.writeFileSync(path.join(unitTodoDir, "TODO_MANUAL_REVIEW_UPPER.MD"), "# upper\n");
        fs.writeFileSync(path.join(unitTodoDir, "todo_manual_review_lower.md"), "# lower\n");
        assert(
            ext.listEligibleTodoFiles(unitTmp).length === 0,
            "listEligibleTodoFiles excludes TODO_manual_review_*.md case-insensitively",
        );

        // Mixed eligible + non-.md + subdirectory named *.md + unsorted names
        fs.writeFileSync(path.join(unitTodoDir, "TODO_P3_zebra.md"), "# z\n");
        fs.writeFileSync(path.join(unitTodoDir, "TODO_P1_alpha.md"), "# a\n");
        fs.writeFileSync(path.join(unitTodoDir, "TODO_P2_UPPER.MD"), "# u\n");
        fs.writeFileSync(path.join(unitTodoDir, "notes.txt"), "ignore\n");
        fs.writeFileSync(path.join(unitTodoDir, "README"), "ignore\n");
        fs.mkdirSync(path.join(unitTodoDir, "subdir_fake.md"), { recursive: true });

        const found = ext.listEligibleTodoFiles(unitTmp);
        assert(
            JSON.stringify(found) === JSON.stringify(["TODO_P1_alpha.md", "TODO_P2_UPPER.MD", "TODO_P3_zebra.md"]),
            `listEligibleTodoFiles filters regular .md/.MD files and sorts deterministically (got: ${JSON.stringify(found)})`,
        );
    } finally {
        fs.rmSync(unitTmp, { recursive: true, force: true });
    }

    // -------------------------------------------------------------------------
    // SECTION 3: Fake-RPC integration tests
    // -------------------------------------------------------------------------
    console.log("\n--- C1 — /pipeline-cleanup --help and -h ---");
    {
        const dir = makeTempWorkspace();
        try {
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("--help", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const helpText = capturedLogs.join("\n");
            assert(helpText.includes("/pipeline-cleanup"), "--help mentions /pipeline-cleanup");
            assert(helpText.includes("No-loop-in-progress guard"), "--help documents no-loop guard");
            assert(helpText.includes("TODO_manual_review_*.md"), "--help documents manual-review protection");
            assert(helpText.includes("Mid-work change guard"), "--help documents mid-work change guard");
            assert(helpText.includes("Max 20 complete cleanup loops"), "--help documents 20-loop cap");
            assert(helpText.includes("Steering (live input)"), "--help documents live steering");
            assert(helpText.includes("Low-context wind-down"), "--help documents low-context wind-down");

            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("-h", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            assert(capturedLogs.join("\n").includes("Pipeline-Cleanup"), "-h displays cleanup help text");
            assert(readSpawnLog(dir).length === 0, "--help/-h spawns 0 sub-agents");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }

    console.log("\n--- C2 — Startup no-loop-in-progress guard ---");
    {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "loop_state.md"), "**Goal Summary:** Active<br>\n");
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_item.md"), "# item\n");
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("already in progress"), "Refuses to start when loop_state.md exists");
            assert(readSpawnLog(dir).length === 0, "No-loop guard spawns 0 sub-agents");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }

    console.log("\n--- C3 — Startup no-eligible-TODOs pre-check (empty & manual-review-only) ---");
    {
        const dir = makeTempWorkspace();
        try {
            // Empty TODO dir
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            assert(capturedLogs.join("\n").includes("No eligible non-manual-review TODO files"), "Exits cleanly when TODO dir is empty");
            assert(readSpawnLog(dir).length === 0, "Empty dir spawns 0 sub-agents");

            // Manual-review-only dir
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_manual_review_only.md"), "# manual\n");
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            assert(capturedLogs.join("\n").includes("No eligible non-manual-review TODO files"), "Exits cleanly when only manual-review TODOs exist");
            assert(readSpawnLog(dir).length === 0, "Manual-review-only dir spawns 0 sub-agents");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }

    console.log("\n--- C4 — Interviewer clean stop via [CLEANUP_STOP: NO_ELIGIBLE_TODOS] ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_needs_human.md"), "# ambiguous\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "NO_ELIGIBLE_SENTINEL";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            assert(spawns.length === 1, `Spawns Interviewer exactly once (got ${spawns.length})`);
            assert(out.includes("no remaining TODOs can be completed without user input"), "Prints NO_ELIGIBLE_TODOS completion summary");
            assert(out.includes("Completed 0 cleanup loops"), "Reports 0 completed loops");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C5 — Interviewer fallback clean stop without sentinel (no loop_state.md) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_needs_human.md"), "# ambiguous\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "NO_ELIGIBLE_NO_SENTINEL";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            assert(spawns.length === 1, `Does not re-spawn Interviewer endlessly when sentinel omitted (spawns=${spawns.length})`);
            assert(out.includes("Interviewer exited without starting a new loop"), "Prints fallback clean-exit summary");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C6 — Mid-work changes stop via chunk-split [CLEANUP_STOP: MID_WORK_CHANGES] (with precedence) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_item.md"), "# item\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "MID_WORK_SENTINEL";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            assert(spawns.length === 1, `Halts immediately after Interviewer mid-work warning (spawns=${spawns.length})`);
            assert(out.includes("WARNING: Mid-work uncommitted changes detected"), "Prints prominent mid-work warning banner");
            assert(!out.includes("no remaining TODOs can be completed"), "mid_work takes precedence over no_eligible_todos sentinel");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C7 — Multi-loop happy path (2 loops, manual-review untouched, prompt verification) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_alpha.md"), "# alpha\n");
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P3_beta.md"), "# beta\n");
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_manual_review_keep_me.md"), "# keep\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "MULTI_LOOP_HAPPY";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);

            assert(spawns.length === 6, `Runs 4 sessions in loop 1 + 2 sessions in loop 2 (got ${spawns.length})`);
            assert(spawns[0].systemPrompt.includes("Auto-Cleanup Mode (/pipeline-cleanup"), "Passes CLEANUP_AUTO_INSTRUCTIONS to sub-agent");
            assert(spawns[0].kickoffMessage.includes("Interviewer (Role 01)"), "Session 1 uses Interviewer cleanup kickoff");
            assert(spawns[1].kickoffMessage.includes("Load ai_workspace/loop_state.md"), "Planner+ sessions use loop cleanup kickoff");
            assert(spawns[4].kickoffMessage.includes("Interviewer (Role 01)"), "Loop 2 Session 1 uses Interviewer cleanup kickoff");
            assert(!fs.existsSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_alpha.md")), "First eligible TODO deleted");
            assert(!fs.existsSync(path.join(dir, "ai_workspace", "TODO", "TODO_P3_beta.md")), "Second eligible TODO deleted");
            assert(fs.existsSync(path.join(dir, "ai_workspace", "TODO", "TODO_manual_review_keep_me.md")), "Manual-review TODO untouched");
            assert(out.includes("Completed 2 cleanup loops"), "Reports 2 completed cleanup loops");
            assert(out.includes("no eligible non-manual-review TODOs remain"), "Exits cleanly when no eligible TODOs remain");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C8 — Immediate halt on sub-agent error (non-zero exit & rejected kickoff) ---");
    await withFastFlushDelay(async () => {
        // 8a: Non-zero exit code without agent_end
        const dir1 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir1, "ai_workspace", "TODO", "TODO_P2_err.md"), "# err\n");
            process.env.TEST_TMPDIR = dir1;
            process.env.TEST_CLEANUP_SCENARIO = "NONZERO_EXIT";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir1, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("Cleanup stopped") && out.includes("exited with code 1"), "Halts immediately on non-zero sub-agent exit");
            assert(readSpawnLog(dir1).length === 1, "Does not spawn follow-up sessions after non-zero exit");
        } finally {
            fs.rmSync(dir1, { recursive: true, force: true });
        }

        // 8b: Rejected kickoff RPC response
        const dir2 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir2, "ai_workspace", "TODO", "TODO_P2_err2.md"), "# err2\n");
            process.env.TEST_TMPDIR = dir2;
            process.env.TEST_CLEANUP_SCENARIO = "REJECTED_KICKOFF";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir2, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("rejected kickoff prompt") && out.includes("Simulated provider failure"), "Halts immediately on rejected kickoff prompt");
            assert(readSpawnLog(dir2).length === 1, "Does not spawn follow-up sessions after rejected kickoff");
        } finally {
            fs.rmSync(dir2, { recursive: true, force: true });
        }
    });

    console.log("\n--- C9 — Infinite-loop stuck guard halts entire /pipeline-cleanup ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_stuck_role.md"), "# stuck\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "STUCK_ROLE";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            assert(out.includes("Possible infinite loop detected"), "Triggers infinite-loop warning");
            assert(out.includes("Stopping /pipeline-cleanup immediately"), "Halts entire /pipeline-cleanup on stuck role");
            assert(spawns.length === 3, `Stops before 3rd consecutive Worker spawn (total spawns=${spawns.length})`);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C10 — No-progress safeguard (detects zero progress, no false positive on new TODO) ---");
    await withFastFlushDelay(async () => {
        // 10a: Zero progress halts immediately
        const dir1 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir1, "ai_workspace", "TODO", "TODO_P2_stuck.md"), "# stuck\n");
            process.env.TEST_TMPDIR = dir1;
            process.env.TEST_CLEANUP_SCENARIO = "NO_PROGRESS";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir1, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("zero progress on eligible TODO files"), "Warns and stops when loop deletes zero pre-loop eligible TODOs");
            assert(readSpawnLog(dir1).length === 2, "Does not start Loop 2 after zero-progress loop");
        } finally {
            fs.rmSync(dir1, { recursive: true, force: true });
        }

        // 10b: Deleting 1 pre-existing TODO while creating 1 new TODO is valid progress (no false positive)
        const dir2 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir2, "ai_workspace", "TODO", "TODO_P2_old.md"), "# old\n");
            process.env.TEST_TMPDIR = dir2;
            process.env.TEST_CLEANUP_SCENARIO = "PROGRESS_WITH_NEW_TODO";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir2, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(!out.includes("zero progress"), "No false positive when old TODO deleted and new out-of-scope TODO created");
            assert(readSpawnLog(dir2).length === 3, `Proceeds to Loop 2 Interviewer (spawns=${readSpawnLog(dir2).length})`);
            assert(out.includes("Completed 1 cleanup loop"), "Reports 1 completed loop before clean stop");
        } finally {
            fs.rmSync(dir2, { recursive: true, force: true });
        }
    });

    console.log("\n--- C11 — 20-loop hard cap (MAX_CLEANUP_LOOPS = 20) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            for (let n = 1; n <= 22; n++) {
                const padded = String(n).padStart(2, "0");
                fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", `TODO_P3_item_${padded}.md`), `# item ${n}\n`);
            }
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "CAP_20_LOOPS";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            const remaining = ext.listEligibleTodoFiles(dir);

            assert(spawns.length === 40, `Runs exactly 20 complete loops (40 sessions, got ${spawns.length})`);
            assert(remaining.length === 2, `Leaves 2 remaining candidate TODOs after 20 loops (got ${remaining.length})`);
            assert(out.includes("Max cleanup loops (20) reached"), "Prints 20-loop hard cap summary");
            assert(out.includes("Completed 20 cleanup loops; 2 candidate TODO files still remain"), "Reports exact completed & remaining counts");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C12 — Live steering, low-context wind-down resume, and re-entrancy guard ---");
    await withFastFlushDelay(async () => {
        // 12a: Steering + wind-down resume
        const dir1 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir1, "ai_workspace", "TODO", "TODO_P2_steer_test.md"), "# steer\n");
            process.env.TEST_TMPDIR = dir1;
            process.env.TEST_CLEANUP_SCENARIO = "STEERING_AND_WINDDOWN";
            clearLogs();

            const steerPromise = new Promise((resolve) => {
                const timer = setInterval(() => {
                    if (capturedLogs.some((l) => l.includes("Interviewer inspecting TODOs"))) {
                        clearInterval(timer);
                        const res = events["input"]({ source: "interactive", text: "focus on alpha" });
                        resolve(res);
                    }
                }, 10);
            });

            overrideOutput();
            const runPromise = commands["pipeline-cleanup"].handler("", { cwd: dir1, hasUI: true, ui: { setStatus: () => {} } });
            const steerRes = await steerPromise;
            await runPromise;
            restoreOutput();

            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir1);
            assert(steerRes?.action === "handled", "Live steering input is handled during /pipeline-cleanup");
            assert(out.includes("🎯 Steering → focus on alpha"), "Steering echoed visibly during /pipeline-cleanup");
            assert(out.includes("Low context detected") && out.includes("stats: 7000"), "Low-context wind-down triggers during /pipeline-cleanup");
            assert(spawns.length === 3, `Wind-down resumes in fresh session and finishes loop (spawns=${spawns.length})`);
            assert(out.includes("Completed 1 cleanup loop"), "Loop completes cleanly after wind-down resume");
        } finally {
            fs.rmSync(dir1, { recursive: true, force: true });
        }

        // 12b: Re-entrant invocation refused while active
        const dir2 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir2, "ai_workspace", "TODO", "TODO_P2_reentrant.md"), "# reentrant\n");
            process.env.TEST_TMPDIR = dir2;
            process.env.TEST_CLEANUP_SCENARIO = "REENTRANCY";
            clearLogs();
            overrideOutput();
            const p1 = commands["pipeline-cleanup"].handler("", { cwd: dir2, hasUI: true, ui: { setStatus: () => {} } });
            // Call immediately while _pipelineRunning is true
            await commands["pipeline-cleanup"].handler("", { cwd: dir2, hasUI: true, ui: { setStatus: () => {} } });
            await p1;
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("A pipeline run is already in progress"), "Refuses re-entrant /pipeline-cleanup invocation");
            assert(readSpawnLog(dir2).length === 1, "Re-entrant call does not spawn a second sub-agent");
        } finally {
            fs.rmSync(dir2, { recursive: true, force: true });
        }
    });

    // -------------------------------------------------------------------------
    // SECTION 4: Send-back fix coverage (Reviewer Warnings #1–#3)
    // -------------------------------------------------------------------------

    console.log("\n--- C13 — Sentinel matching precision (send-back Warning #3a) ---");
    await withFastFlushDelay(async () => {
        // 13a: Prose mention of NO_ELIGIBLE_TODOS must NOT set stopSignal -> generic fallback message
        const dir1 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir1, "ai_workspace", "TODO", "TODO_P2_needs_human.md"), "# ambiguous\n");
            process.env.TEST_TMPDIR = dir1;
            process.env.TEST_CLEANUP_SCENARIO = "PROSE_NO_ELIGIBLE";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir1, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(readSpawnLog(dir1).length === 1, `Prose sentinel mention spawns Interviewer exactly once (spawns=${readSpawnLog(dir1).length})`);
            assert(out.includes("[CLEANUP_STOP: NO_ELIGIBLE_TODOS]"), "Prose line containing sentinel was actually streamed (test is meaningful)");
            assert(out.includes("Interviewer exited without starting a new loop"), "Prose mention does NOT set stopSignal — generic fallback clean-exit message printed");
            assert(!out.includes("no remaining TODOs can be completed without user input"), "Sentinel-specific completion summary is absent for prose-only mention");
        } finally {
            fs.rmSync(dir1, { recursive: true, force: true });
        }

        // 13b: Backtick-wrapped standalone MID_WORK sentinel must still trigger the warning banner
        const dir2 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir2, "ai_workspace", "TODO", "TODO_P2_item.md"), "# item\n");
            process.env.TEST_TMPDIR = dir2;
            process.env.TEST_CLEANUP_SCENARIO = "BACKTICK_MID_WORK";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir2, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(readSpawnLog(dir2).length === 1, `Backtick-wrapped sentinel halts immediately (spawns=${readSpawnLog(dir2).length})`);
            assert(out.includes("WARNING: Mid-work uncommitted changes detected"), "Markdown-normalized backtick-wrapped MID_WORK sentinel still matches");
        } finally {
            fs.rmSync(dir2, { recursive: true, force: true });
        }

        // 13c: Prose mention of MID_WORK_CHANGES while Interviewer starts a loop -> no false-positive abort
        const dir3 = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir3, "ai_workspace", "TODO", "TODO_P2_item.md"), "# item\n");
            process.env.TEST_TMPDIR = dir3;
            process.env.TEST_CLEANUP_SCENARIO = "PROSE_MID_WORK_LOOP";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir3, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(readSpawnLog(dir3).length === 2, `Prose mid-work mention does not abort — loop proceeds to session 2 (spawns=${readSpawnLog(dir3).length})`);
            assert(!out.includes("WARNING: Mid-work uncommitted changes detected"), "No false-positive mid-work banner for prose-only sentinel mention");
            assert(out.includes("Cleanup complete — no eligible non-manual-review TODOs remain"), "Run completes cleanly after prose-mention loop finishes");
        } finally {
            fs.rmSync(dir3, { recursive: true, force: true });
        }
    });

    console.log("\n--- C14 — Downstream role sentinel scoping (send-back Warning #3b) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_item.md"), "# item\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "DOWNSTREAM_SENTINEL";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            assert(out.includes("[CLEANUP_STOP: MID_WORK_CHANGES]"), "Planner's quoted sentinel line was actually streamed (test is meaningful)");
            assert(spawns.length === 3, `Downstream mid_work signal ignored — Worker session still runs (spawns=${spawns.length})`);
            assert(!out.includes("WARNING: Mid-work uncommitted changes detected"), "No false-positive mid-work banner from downstream role sentinel quote");
            assert(out.includes("Cleanup complete — no eligible non-manual-review TODOs remain"), "Loop completes cleanly after downstream role quotes sentinel");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C15 — Silent exit code 0 before agent_end (send-back Warning #2) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", "TODO_P2_err.md"), "# err\n");
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "SILENT_ZERO_EXIT";
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            assert(out.includes("Sub-agent exited with code 0 before agent_end"), "Silent code-0 exit before agent_end is reported as an error");
            assert(out.includes("Cleanup stopped — Interviewer failed"), "Cleanup halts immediately on silent code-0 sub-agent exit");
            assert(readSpawnLog(dir).length === 1, `Does not spawn follow-up sessions after silent code-0 exit (spawns=${readSpawnLog(dir).length})`);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n--- C16 — Exactly 20 eligible TODOs all resolved -> clean completion (send-back Warning #1) ---");
    await withFastFlushDelay(async () => {
        const dir = makeTempWorkspace();
        try {
            for (let n = 1; n <= 20; n++) {
                const padded = String(n).padStart(2, "0");
                fs.writeFileSync(path.join(dir, "ai_workspace", "TODO", `TODO_P3_item_${padded}.md`), `# item ${n}\n`);
            }
            process.env.TEST_TMPDIR = dir;
            process.env.TEST_CLEANUP_SCENARIO = "CAP_20_LOOPS"; // deletes one eligible TODO per loop
            clearLogs();
            overrideOutput();
            await commands["pipeline-cleanup"].handler("", { cwd: dir, hasUI: true, ui: { setStatus: () => {} } });
            restoreOutput();
            const out = capturedLogs.join("\n");
            const spawns = readSpawnLog(dir);
            const remaining = ext.listEligibleTodoFiles(dir);

            assert(spawns.length === 40, `Runs exactly 20 complete loops (40 sessions, got ${spawns.length})`);
            assert(remaining.length === 0, `All 20 eligible TODOs deleted after loop 20 (got ${remaining.length} remaining)`);
            assert(out.includes("Cleanup complete — no eligible non-manual-review TODOs remain"), "Prints clean completion message when final TODO removed on exact 20th loop");
            assert(!out.includes("Max cleanup loops (20) reached"), "Does NOT print cap-reached warning when 0 TODOs remain after loop 20");
            assert(out.includes("Completed 20 cleanup loops"), "Reports 20 completed loops in clean completion message");
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    console.log("\n" + "=".repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed, 0 skipped`);
    console.log("=".repeat(50) + "\n");

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
    restoreOutput();
    console.error(err);
    process.exit(1);
});
