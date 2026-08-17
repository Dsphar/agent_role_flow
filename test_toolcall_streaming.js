/**
 * Deep tests for pipeline-auto.ts tool-call streaming + context-usage prefix (this loop's changes).
 *
 * Covers:
 *  - Tool name resolved from toolcall_end.toolCall.name (start event carries no name)
 *  - argNote extraction via toolcall_delta buffering (command truncation, path basename)
 *  - Error tool reported exactly once (no duplicate ❌ lines)
 *  - Context-usage prefix format "(P.P%) /T.Tk" with green/yellow/red ANSI thresholds
 *  - Null stats (post-compaction) → no prefix emitted
 *
 * Isolation: scenarios run against a temp dir (TEST_TMPDIR) so the real
 * ai_workspace/loop_state.md is never touched. Follows the dual-mode convention of
 * test_pipeline_auto_features.js — this file doubles as the fake RPC child process.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// -----------------------------------------------------------------------------
// FAKE RPC CHILD PROCESS (when spawned by the extension)
// -----------------------------------------------------------------------------
if (process.argv.includes("--mode") && process.argv.includes("rpc")) {
    const scenario = process.env.TEST_SCENARIO;
    const tmpdir = process.env.TEST_TMPDIR || __dirname;

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
        try { fs.unlinkSync(path.join(tmpdir, 'ai_workspace', 'loop_state.md')); } catch (e) {}
        sendJson({ type: "agent_end" });
    }

    const ev = (type, extra = {}) => ({ type: "message_update", assistantMessageEvent: Object.assign({ type }, extra) });
    const textDelta = (delta) => ev("text_delta", { delta });
    const toolStart = () => ev("toolcall_start");
    const toolDelta = (delta) => ev("toolcall_delta", { delta });
    const toolEnd = (name, isError) => ev("toolcall_end", { toolCall: { name, arguments: {} }, isError });

    // Per-scenario get_session_stats responses (window 200k keeps remaining ≥15k for T5/T6)
    const STATS = {
        "T5": { tokens: 80000, window: 200000 },   // 40.0% — green zone
        "T6": { tokens: 160000, window: 200000 },  // 80.0% — yellow zone
        "T7": { tokens: 180000, window: 200000 }   // 90.0% — red zone; remaining 20k >= 15k (no wind-down)
    };

    rl.on('line', (line) => {
        if (!line.trim()) return;
        const req = JSON.parse(line);

        if (req.id === "kickoff") {
            runScenario(scenario);
        } else if (req.type === "get_session_stats") {
            if (scenario === "T8") {
                // Post-compaction shape: tokens/percent null → extension must emit no prefix
                sendJson({ type: "response", command: "get_session_stats", data: { contextUsage: { tokens: null, contextWindow: 200000, percent: null } } });
            } else {
                const s = STATS[scenario] || { tokens: 1000, window: 32000 };
                sendJson({ type: "response", command: "get_session_stats", data: { contextUsage: { tokens: s.tokens, contextWindow: s.window, percent: (s.tokens / s.window) * 100 } } });
            }
        } else if (req.id === "wind-down") {
            process.stderr.write(`[CHILD_RCV_WIND_DOWN]\n`);
            sendJson({ type: "response", command: "prompt", id: req.id, success: true });
            endSession();
        }
    });

    function runScenario(sc) {
        if (sc === "T1") {
            // Name must come from toolcall_end — start event carries no name field at all
            sendJson(textDelta("Before tool\n"));
            setTimeout(() => {
                sendJson(toolStart());
                sendJson(toolEnd("bash", false));
                setTimeout(endSession, 50);
            }, 30);
        } else if (sc === "T2") {
            // argNote: command value >20 chars → truncated with "..." (delta split across two events)
            setTimeout(() => {
                sendJson(toolStart());
                sendJson(toolDelta('{"command": '));
                sendJson(toolDelta('"echo hello world this is long"}'));
                sendJson(toolEnd("bash", false));
                setTimeout(endSession, 50);
            }, 30);
        } else if (sc === "T3") {
            // argNote: path value → basename only
            setTimeout(() => {
                sendJson(toolStart());
                sendJson(toolDelta('{"path": "/some/dir/file.txt"}'));
                sendJson(toolEnd("read", false));
                setTimeout(endSession, 50);
            }, 30);
        } else if (sc === "T4") {
            // Error tool — must be reported exactly once with ❌
            sendJson(textDelta("Work\n"));
            setTimeout(() => {
                sendJson(toolStart());
                sendJson(toolEnd("bash", true));
                setTimeout(endSession, 50);
            }, 30);
        } else if (sc === "T9") {
            // Two consecutive tools — bookkeeping across start/end pairs
            setTimeout(() => {
                sendJson(toolStart());
                sendJson(toolDelta('{"command":"ls"}'));
                sendJson(toolEnd("bash", false));
                sendJson(toolStart());
                sendJson(toolEnd("grep", true));
                setTimeout(endSession, 50);
            }, 30);
        } else if (sc === "T5" || sc === "T6" || sc === "T7") {
            // First text line triggers the stats poll; second line is emitted after the
            // response lands, so it carries the colored prefix.
            sendJson(textDelta("Poll trigger\n"));
            setTimeout(() => {
                const label = sc === "T5" ? "Green line" : sc === "T6" ? "Yellow line" : "Red line";
                sendJson(textDelta(label + "\n"));
                setTimeout(endSession, 120);
            }, 100);
        } else if (sc === "T8") {
            // Null stats → second line must be emitted bare (no prefix)
            sendJson(textDelta("Poll trigger\n"));
            setTimeout(() => {
                sendJson(textDelta("No prefix line\n"));
                setTimeout(endSession, 120);
            }, 100);
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
const originalStdoutWrite = process.stdout.write;
let stdoutBuffer = "";

function overrideConsoleLog() {
    console.log = function (...args) {
        if (stdoutBuffer) { capturedLogs.push(stdoutBuffer); stdoutBuffer = ""; }
        capturedLogs.push(args.join(" "));
    };
    process.stdout.write = function (chunk) {
        const str = chunk.toString();
        if (str === "\n") {
            if (stdoutBuffer) { capturedLogs.push(stdoutBuffer); stdoutBuffer = ""; }
        } else {
            stdoutBuffer += str;
        }
    };
}
function restoreConsoleLog() {
    if (stdoutBuffer) { capturedLogs.push(stdoutBuffer); stdoutBuffer = ""; }
    console.log = originalConsoleLog;
    process.stdout.write = originalStdoutWrite;
}
function clearLogs() {
    capturedLogs.length = 0;
    stdoutBuffer = "";
}

async function runTests() {
    // Temp-dir isolation — real ai_workspace/loop_state.md is never touched.
    const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolcall_test_'));
    fs.mkdirSync(path.join(tmpdir, 'ai_workspace'), { recursive: true });

    function writeTmpLoopState() {
        fs.writeFileSync(
            path.join(tmpdir, 'ai_workspace', 'loop_state.md'),
            `**Goal Summary:** Test\n**Current Role:** Tester (Role 04) | History: \ntest_level=deep | do_docs=true | can_loop=true\n`
        );
    }

    const mockCtx = { cwd: tmpdir, hasUI: true, ui: { setStatus: () => {} } };
    const commands = {};
    const events = {};
    const mockPi = {
        registerCommand: (name, config) => { commands[name] = config; },
        on: (name, handler) => { events[name] = handler; }
    };

    console.log("\n=== test_toolcall_streaming.js ===");
    const ext = await import('./.pi/extensions/pipeline-auto.ts');
    ext.default(mockPi);

    async function runScenario(scenario) {
        writeTmpLoopState();
        process.env.TEST_SCENARIO = scenario;
        process.env.TEST_TMPDIR = tmpdir;
        clearLogs();
        overrideConsoleLog();
        await commands["pipeline-auto"].handler("", mockCtx);
        restoreConsoleLog();
        return capturedLogs.slice();
    }

    console.log("\n--- T1 — Tool name resolved from toolcall_end (no name in start event) ---");
    let logs = await runScenario("T1");
    assert(logs.some(l => l.includes("🧰") && l.includes("Tool running")), "Start emits generic 'Tool running...' line");
    assert(logs.some(l => l.includes("✅ bash")), "End emits success with name from toolCall.name");
    assert(!logs.some(l => l.includes("undefined")), "No 'undefined' leaks into output (original bug regression)");

    console.log("\n--- T2 — argNote: command truncation via toolcall_delta buffering ---");
    logs = await runScenario("T2");
    assert(logs.some(l => /✅ bash \(echo hello world thi\.\.\.\)/.test(l)), "Command >20 chars truncated to 20 + '...'");

    console.log("\n--- T3 — argNote: path basename ---");
    logs = await runScenario("T3");
    assert(logs.some(l => /✅ read \(file\.txt\)/.test(l)), "Path value reduced to basename");

    console.log("\n--- T4 — Error tool reported exactly once ---");
    logs = await runScenario("T4");
    const errLines = logs.filter(l => l.includes("❌") && l.includes("bash"));
    assert(errLines.length === 1, `Errored tool produces exactly one ❌ line (got ${errLines.length}: ${JSON.stringify(errLines)})`);

    console.log("\n--- T5 — Prefix format + green zone (<70%) ---");
    logs = await runScenario("T5");
    assert(logs.some(l => /\x1b\[32m\(40\.0%\) \/200\.0k \x1b\[0m Green line/.test(l)), "Green prefix '(40.0%) /200.0k' on non-blank line");
    assert(!logs.some(l => l.includes("80.0k /")), "Old 'N.Nk/T.Tk' token format no longer present");

    console.log("\n--- T6 — Prefix yellow zone (70–90%) ---");
    logs = await runScenario("T6");
    assert(logs.some(l => /\x1b\[33m\(80\.0%\) \/200\.0k \x1b\[0m Yellow line/.test(l)), "Yellow prefix '(80.0%) /200.0k' on non-blank line");

    console.log("\n--- T7 — Prefix red zone (≥90%) ---");
    logs = await runScenario("T7");
    assert(logs.some(l => /\x1b\[31m\(90\.0%\) \/200\.0k \x1b\[0m Red line/.test(l)), "Red prefix '(90.0%) /200.0k' on non-blank line");

    console.log("\n--- T8 — Null stats (post-compaction) → no prefix ---");
    logs = await runScenario("T8");
    assert(logs.some(l => l === "No prefix line"), "Line emitted bare when stats are null");
    assert(!logs.some(l => /\x1b\[3[23]m/.test(l)), "No colored prefix emitted for null stats");

    console.log("\n--- T9 — Multi-tool bookkeeping (success then error) ---");
    logs = await runScenario("T9");
    assert(logs.some(l => /✅ bash \(ls\)/.test(l)), "First tool reported with name + short command argNote");
    assert(logs.some(l => l.includes("❌") && l.includes("grep")), "Second (errored) tool reported by name from its end event");
    assert(!logs.some(l => l.includes("undefined")), "No 'undefined' leaks across consecutive tools");

    // Cleanup temp dir
    try { fs.rmSync(tmpdir, { recursive: true, force: true }); } catch (e) {}

    console.log("\n" + "=".repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed, 0 skipped`);
    console.log("=".repeat(50) + "\n");

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
