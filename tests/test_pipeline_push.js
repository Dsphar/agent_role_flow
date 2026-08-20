/**
 * Quick tests for pipeline-auto.ts helper functions.
 * Replicates getCurrentRole() and parseCanLoop() logic in plain JS,
 * testing against various inputs including edge cases from the spec.
 */

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✓ ${testName}`);
        passed++;
    } else {
        console.log(`  ✗ FAIL: ${testName}`);
        failed++;
    }
}

// --- Replicate getCurrentRole() logic from pipeline-auto.ts ---
function getCurrentRole(content) {
    const lines = content.split("\n");
    if (lines.length < 2) return undefined;
    let line2 = lines[1].replace(/<br>\s*$/, "");
    const match = line2.match(/\*\*Current Role:\*\*\s*(.+?)(?:\s+(?:\(in-sendback\)\s+)?\(Role\s+\d+\)|\s+\|)/i);
    return match ? match[1].trim() : undefined;
}

// --- Replicate parseCanLoop() logic from pipeline-push.ts ---
function parseCanLoop(content) {
    const lines = content.split("\n");
    if (lines.length < 3) return false;
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
    return false;
}

// ============================================================
console.log("\n=== Test Suite: getCurrentRole() regex fix ===\n");

// Build test content from line 2 variations
function makeContent(line2) {
    return ["dummy", line2, "dummy"].join("\n");
}

// Basic single-word role names
assert(getCurrentRole(makeContent("**Current Role:** Interviewer (Role 01) | History: ")) === "Interviewer",
    "Extracts 'Interviewer' from standard format");

assert(getCurrentRole(makeContent("**Current Role:** Planner (Role 02) | History: Interviewer")) === "Planner",
    "Extracts 'Planner' from standard format");

assert(getCurrentRole(makeContent("**Current Role:** Worker (Role 03) | History: Interviewer → Planner")) === "Worker",
    "Extracts 'Worker' from standard format");

// Multi-word role names (the original bug case — lazy .+? matched only first letter)
assert(getCurrentRole(makeContent("**Current Role:** Code Reviewer (Role 06) | History: Interviewer → Planner")) === "Code Reviewer",
    "Extracts multi-word 'Code Reviewer' (original regex bug case)");

assert(getCurrentRole(makeContent("**Current Role:** Project Manager (Role 99) | History: ")) === "Project Manager",
    "Extracts multi-word 'Project Manager'");

// In-sendback suffix
assert(getCurrentRole(makeContent("**Current Role:** Tester (in-sendback) (Role 04) | History: Interviewer → Planner → Worker")) === "Tester",
    "Extracts 'Tester' with (in-sendback) suffix");

assert(getCurrentRole(makeContent("**Current Role:** Code Reviewer (in-sendback) (Role 06) | History: ")) === "Code Reviewer",
    "Extracts multi-word 'Code Reviewer' with (in-sendback) suffix");

// Edge cases
assert(getCurrentRole(makeContent("not a valid line")) === undefined,
    "Returns undefined for non-matching line 2");

const shortContent = ["only one line"].join("\n");
assert(getCurrentRole(shortContent) === undefined,
    "Returns undefined when file has < 2 lines");

// Test against actual loop_state.md in the repo
console.log("\n--- Testing against actual loop_state.md ---");
try {
    const actual = fs.readFileSync(path.join(__dirname, "ai_workspace", "loop_state.md"), "utf-8");
    const role = getCurrentRole(actual);
    assert(role === "Tester", `Extracts 'Tester' from actual file (got: '${role}')`);
} catch (e) {
    console.log(`  ✗ FAIL: Could not read loop_state.md: ${e.message}`);
    failed++;
}

// ============================================================
console.log("\n=== Test Suite: parseCanLoop() ===\n");

function makeContent3(line3) {
    return ["dummy", "dummy", line3].join("\n");
}

// Basic true/false parsing
assert(parseCanLoop(makeContent3("test_level=quick | do_docs=no | can_loop=true")) === true,
    "Returns true when can_loop=true");

assert(parseCanLoop(makeContent3("test_level=deep | do_docs=yes | can_loop=false")) === false,
    "Returns false when can_loop=false");

// Key in different positions
assert(parseCanLoop(makeContent3("can_loop=true | test_level=quick | do_docs=no")) === true,
    "Parses can_loop when it's the first key");

assert(parseCanLoop(makeContent3("do_docs=no | can_loop=true | test_level=quick")) === true,
    "Parses can_loop when it's in the middle");

// Edge cases — missing file content (simulated by short arrays)
const noLine3 = ["only", "two"].join("\n");
assert(parseCanLoop(noLine3) === false,
    "Returns false when file has < 3 lines");

// Missing key
assert(parseCanLoop(makeContent3("test_level=quick | do_docs=no")) === false,
    "Returns false when can_loop key is absent");

// Unrecognized values (should return false per spec)
assert(parseCanLoop(makeContent3("can_loop=yes")) === false,
    "Returns false for unrecognized value 'yes'");

assert(parseCanLoop(makeContent3("can_loop=1")) === false,
    "Returns false for unrecognized value '1'");

assert(parseCanLoop(makeContent3("can_loop=TRUE")) === false,
    "Returns false for case-sensitive mismatch 'TRUE'");

// ============================================================
console.log("\n=== Test Suite: Command rename verification ===\n");

const extSource = fs.readFileSync(path.join(__dirname, ".pi", "extensions", "pipeline-auto.ts"), "utf-8");

assert(!extSource.includes("/autoloop"),
    "No '/autoloop' references remain in extension source");

assert(extSource.includes("registerCommand(\"pipeline-auto\""),
    "Command registered as 'pipeline-auto'");

assert(extSource.includes("/pipeline-auto"),
    "Help text uses '/pipeline-auto'");

// ============================================================
console.log("\n=== Test Suite: can_loop guard in handler ===\n");

assert(extSource.includes("if (!parseCanLoop(cwd))"),
    "Handler checks parseCanLoop before proceeding");

assert(extSource.includes("Auto-looping is not yet enabled"),
    "Guard prints warning message when can_loop is false");

// ============================================================
console.log("\n=== Test Suite: turn_end listener ===\n");

assert(extSource.includes('pi.on("turn_end"'),
    'Registers turn_end event listener');

assert(extSource.includes("c?.hasUI") || extSource.includes("ctx.hasUI"),
    "Listener guards behind hasUI check (no-op in print mode)");

assert(extSource.includes('setStatus("pipeline-auto"'),
    "Uses setStatus with 'pipeline-auto' key for footer status");

// ============================================================
console.log("\n=== Test Suite: AGENTS.md updates ===\n");

const agentsMd = fs.readFileSync(path.join(__dirname, "AGENTS.md"), "utf-8");

assert(agentsMd.includes("can_loop={true|false}"),
    "Format spec includes can_loop={true|false}");

assert(agentsMd.match(/can_loop.*must be `true` or `false`/),
    "Guardrail mentions can_loop must be true or false");

// ============================================================
console.log("\n=== Test Suite: Interviewer role updates ===\n");

const interviewer = fs.readFileSync(path.join(__dirname, "ai_workspace", "roles", "01_interviewer.md"), "utf-8");

assert(interviewer.includes("can_loop=false"),
    "Interviewer init template includes can_loop=false");

assert(interviewer.match(/Always set `?can_loop=false/),
    "Interviewer instructed to always set can_loop=false when recording config");

// ============================================================
console.log("\n=== Test Suite: Planner role updates ===\n");

const planner = fs.readFileSync(path.join(__dirname, "ai_workspace", "roles", "02_planner.md"), "utf-8");

assert(planner.includes("can_loop=true"),
    "Planner instructed to set can_loop=true before transitioning");

// ============================================================
console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
console.log("=".repeat(50) + "\n");

process.exit(failed > 0 ? 1 : 0);
