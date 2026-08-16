const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------------
// FAKE RPC CHILD PROCESS (when spawned by the extension)
// -----------------------------------------------------------------------------
if (process.argv.includes("--mode") && process.argv.includes("rpc")) {
    const scenario = process.env.TEST_SCENARIO;

    function sendJson(obj) {
        process.stdout.write(JSON.stringify(obj) + "\n");
    }

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    function endSession() {
        if (scenario !== "S9") {
            try { fs.unlinkSync(path.join(__dirname, 'ai_workspace', 'loop_state.md')); } catch(e) {}
        }
        sendJson({ type: "agent_end" });
    }

    rl.on('line', (line) => {
        if (!line.trim()) return;
        const req = JSON.parse(line);

        if (req.id === "kickoff") {
            runScenario(scenario);
        } else if (req.id && req.id.startsWith("steer-")) {
            process.stderr.write(`[CHILD_RCV_STEER] ${req.message}\n`);
            if (scenario === "S8") {
                sendJson({ type: "response", command: "prompt", id: req.id, success: false });
            } else {
                sendJson({ type: "response", command: "prompt", id: req.id, success: true });
            }
        } else if (req.id === "wind-down") {
            process.stderr.write(`[CHILD_RCV_WIND_DOWN]\n`);
            sendJson({ type: "response", command: "prompt", id: req.id, success: true });
            endSession();
        } else if (req.type === "get_session_stats") {
            let tokens = 1000;
            let window = 32000;
            if (scenario === "S3") {
                tokens = 25000;
                window = 32000;
            }
            sendJson({
                type: "response", command: "get_session_stats",
                data: { contextUsage: { tokens, contextWindow: window, percent: (tokens/window)*100 } }
            });
        }
    });

    function runScenario(sc) {
        if (sc === "S2") {
            // Send text with 6 consecutive newlines
            sendJson({ type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "Line 1\n\n\n\n\n\n\nLine 2" } });
            sendJson({ type: "message_update", assistantMessageEvent: { type: "toolcall_start", toolName: "my_tool" } });
            sendJson({ type: "message_update", assistantMessageEvent: { type: "toolcall_end", isError: false } });
            setTimeout(endSession, 50);
        } else if (sc === "S3") {
            sendJson({ type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "Triggering flush\n" } });
            setTimeout(() => {
                sendJson({ type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "Triggering flush 2\n" } });
            }, 50);
            setTimeout(endSession, 150);
        } else if (sc === "S4") {
            sendJson({ type: "compaction_start", reason: "threshold" });
            setTimeout(endSession, 100);
        } else if (sc === "S5") {
            sendJson({ type: "compaction_start", reason: "manual" });
            setTimeout(endSession, 50);
        } else if (sc === "S6" || sc === "S8") {
            sendJson({ type: "message_update", assistantMessageEvent: { type: "text_delta", delta: "Waiting for steering...\n" } });
            setTimeout(endSession, 200);
        } else if (sc === "S7") {
            endSession();
        } else if (sc === "S9") {
            const counterFile = path.join(__dirname, 'session_counter.txt');
            const c = fs.readFileSync(counterFile, 'utf8');
            if (c === "1") {
                fs.writeFileSync(counterFile, "2");
                sendJson({ type: "compaction_start", reason: "threshold" }); 
            } else {
                fs.unlinkSync(path.join(__dirname, 'ai_workspace', 'loop_state.md'));
                sendJson({ type: "agent_end" });
            }
        } else {
            setTimeout(endSession, 10);
        }
    }
    
    // Explicit exit on stdin end
    process.stdin.on('end', () => process.exit(0));

    return;
}

// -----------------------------------------------------------------------------
// TEST RUNNER
// -----------------------------------------------------------------------------
let passed = 0, failed = 0;
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
function overrideConsoleLog() {
    console.log = function(...args) {
        capturedLogs.push(args.join(" "));
    };
}
function restoreConsoleLog() {
    console.log = originalConsoleLog;
}
function clearLogs() {
    capturedLogs.length = 0;
}

const mockCtx = {
    cwd: __dirname,
    hasUI: true,
    ui: { setStatus: () => {} }
};

const commands = {};
const events = {};
const mockPi = {
    registerCommand: (name, config) => { commands[name] = config; },
    on: (name, handler) => { events[name] = handler; }
};

async function runTests() {
    console.log("\n=== test_pipeline_auto_features.js ===");
    const ext = await import('./.pi/extensions/pipeline-auto.ts');
    ext.default(mockPi);

    const loopStatePath = path.join(__dirname, 'ai_workspace', 'loop_state.md');
    fs.mkdirSync(path.dirname(loopStatePath), { recursive: true });

    function writeLoopState(canLoop) {
        fs.writeFileSync(loopStatePath, `**Goal Summary:** Test\n**Current Role:** Tester (Role 04) | History: \ntest_level=deep | do_docs=true | can_loop=${canLoop}\n`);
    }

    console.log("\n--- S0 — Module-load regression ---");
    assert(commands["pipeline-auto"], "Command registers");
    assert(events["input"], "input event registers");
    
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("--help", mockCtx);
    restoreConsoleLog();
    const helpOutput = capturedLogs.join("\n");
    assert(helpOutput.includes("separator lines"), "Help text covers condensation");
    assert(helpOutput.includes("Steering (live input)"), "Help text covers steering");
    assert(helpOutput.includes("Low-context wind-down"), "Help text covers wind-down");

    console.log("\n--- S1 — can_loop guard e2e ---");
    clearLogs();
    writeLoopState(false);
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    assert(capturedLogs.join(" ").includes("not yet enabled"), "Guards against false can_loop");
    const inertRes = events["input"]({ source: "interactive", text: "hello" });
    assert(!inertRes, "Input handler returns undefined when not running");

    console.log("\n--- S2 — Blank-line condensation e2e ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S2";
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    
    // Check if we get a single line with multiple dashes instead of multiple '-' lines
    // "Line 1\n\n\n\n\n\n\nLine 2" -> 6 blank lines between Line 1 and Line 2
    assert(capturedLogs.some(l => l === "------"), "6 newlines collapse to '------'");
    assert(!capturedLogs.some(l => l === "-"), "Should not emit single dash for multiple newlines");
    assert(capturedLogs.some(l => l.includes("Line 2")), "Prefix added to non-blank line");
    assert(capturedLogs.some(l => l.includes("my_tool") && l.includes("✅")), "Tool-result routed through emitLine");

    console.log("\n--- S3 — Wind-down Trigger A (stats remaining <15k) ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S3";
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    const warns3 = capturedLogs.filter(l => l.includes("Low context detected") && l.includes("stats: 7000"));
    assert(warns3.length === 1, "Wind-down Trigger A fires exactly once when remaining <15k");

    console.log("\n--- S4 — Wind-down Trigger B (compaction threshold/overflow) ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S4";
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    const warns4 = capturedLogs.filter(l => l.includes("Low context detected") && l.includes("compaction: threshold"));
    assert(warns4.length === 1, "Wind-down Trigger B fires exactly once");

    console.log("\n--- S5 — Manual compaction reason does NOT trigger wind-down ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S5";
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    assert(capturedLogs.filter(l => l.includes("Low context detected")).length === 0, "Manual compaction does not trigger");

    console.log("\n--- S6 — Live steering e2e ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S6";
    const steerPromise = new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (capturedLogs.some(l => l.includes("Session 1/"))) {
                clearInterval(checkInterval);
                const res = events["input"]({ source: "interactive", text: "steer text" });
                const resCommand = events["input"]({ source: "interactive", text: "/steer text" });
                const resBash = events["input"]({ source: "interactive", text: "!bash text" });
                const resSpace = events["input"]({ source: "interactive", text: "   " });
                const resNonInt = events["input"]({ source: "script", text: "steer text" });
                resolve({res, resCommand, resBash, resSpace, resNonInt});
            }
        }, 10);
    });

    overrideConsoleLog();
    const handlerPromise = commands["pipeline-auto"].handler("", mockCtx);
    const steerResults = await steerPromise;
    await handlerPromise;
    restoreConsoleLog();

    assert(steerResults.res?.action === "handled", "Plain text handled");
    assert(!steerResults.resCommand, "/ commands pass through untouched");
    assert(!steerResults.resBash, "! commands pass through untouched");
    assert(!steerResults.resSpace, "Whitespace passes through untouched");
    assert(!steerResults.resNonInt, "Non-interactive passes through untouched");
    assert(capturedLogs.some(l => l.includes("🎯 Steering → steer text")), "Echoed visibly");

    console.log("\n--- S7 — Text typed when sub-agent ended ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S7";
    overrideConsoleLog();
    const handlerPromise7 = commands["pipeline-auto"].handler("", mockCtx);
    setTimeout(() => {
        events["input"]({ source: "interactive", text: "late text" });
    }, 50);
    await handlerPromise7;
    restoreConsoleLog();
    assert(capturedLogs.some(l => l.includes("No active sub-agent session") && l.includes("not forwarded")), "Warning for between-sessions window");

    console.log("\n--- S8 — Rejected steer response ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S8";
    const steerPromise8 = new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (capturedLogs.some(l => l.includes("Session 1/"))) {
                clearInterval(checkInterval);
                events["input"]({ source: "interactive", text: "steer text" });
                resolve();
            }
        }, 10);
    });
    overrideConsoleLog();
    const handlerPromise8 = commands["pipeline-auto"].handler("", mockCtx);
    await steerPromise8;
    await handlerPromise8;
    restoreConsoleLog();
    assert(capturedLogs.some(l => l.includes("Message not delivered") && l.includes("sub-agent may have just ended")), "Warning on success:false");

    console.log("\n--- S9 — Wind-down → fresh-session resume e2e ---");
    clearLogs();
    writeLoopState(true);
    process.env.TEST_SCENARIO = "S9";
    fs.writeFileSync(path.join(__dirname, 'session_counter.txt'), "1");
    overrideConsoleLog();
    await commands["pipeline-auto"].handler("", mockCtx);
    restoreConsoleLog();
    
    assert(capturedLogs.some(l => l.includes("Pipeline complete")), "Pipeline completes successfully");
    assert(capturedLogs.some(l => l.includes("Finished in 2 sessions")), "Finished in 2 sessions due to wind-down restart");

    console.log("\n" + "=".repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed, 0 skipped`);
    console.log("=".repeat(50) + "\n");
    
    // Restore loop_state for the pipeline
    writeLoopState(true);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
