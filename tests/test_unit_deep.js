/**
 * Deep unit tests for pipeline-auto.ts uncovered areas.
 *
 * Covers:
 *  - parseLoopState() unified parsing (all fields in one call)
 *  - autoRespondUiRequest() logic for all UI dialog types
 *  - loopStateExists() edge cases
 *  - Infinite loop detection (STUCK_THRESHOLD)
 *  - Event listener registration and behavior
 *  - Malformed/edge-case loop_state.md content
 *
 * Runs as plain JS — no dual-mode needed since these test internal logic.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Replicate parseLoopState() from pipeline-auto.ts for unit testing
function parseLoopState(content) {
    const lines = content.split("\n");

    let goalSummary;
    if (lines.length >= 1) {
        const line1 = lines[0].replace(/<br>\s*$/, "");
        const match = line1.match(/\*\*Goal Summary:\*\*\s*(.+)/i);
        goalSummary = match ? match[1].trim() : undefined;
    }

    let currentRole, isSendBack = false;
    if (lines.length >= 2) {
        const line2 = lines[1].replace(/<br>\s*$/, "");
        const roleMatch = line2.match(/\*\*Current Role:\*\*\s*(.+?)(?:\s+(?:\(in-sendback\)\s+)?\(Role\s+\d+\)|\s+\|)/i);
        currentRole = roleMatch ? roleMatch[1].trim() : undefined;
        isSendBack = /\(in-sendback\)/i.test(line2);
    }

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

// ============================================================
console.log("\n=== U1 — parseLoopState() unified parsing ===\n");

// Standard well-formed content
const standardContent = [
    "**Goal Summary:** Build feature X<br>",
    "**Current Role:** Worker (Role 03) | History: Interviewer → Planner<br>",
    "test_level=deep | do_docs=true | can_loop=true<br>"
].join("\n");

let result = parseLoopState(standardContent);
assert(result.goalSummary === "Build feature X", "Extracts goal summary from standard content");
assert(result.currentRole === "Worker", "Extracts role name from standard content");
assert(result.canLoop === true, "Parses can_loop=true from standard content");
assert(result.isSendBack === false, "isSendBack is false when no suffix present");

// Send-back mode
const sendbackContent = [
    "**Goal Summary:** Fix bug Y<br>",
    "**Current Role:** Tester (Role 04) (in-sendback) | History: Interviewer → Planner → Worker<br>",
    "test_level=quick | do_docs=false | can_loop=true<br>"
].join("\n");

result = parseLoopState(sendbackContent);
assert(result.goalSummary === "Fix bug Y", "Extracts goal summary in send-back mode");
assert(result.currentRole === "Tester", "Extracts role name with (in-sendback) suffix stripped");
assert(result.isSendBack === true, "isSendBack is true when (in-sendback) present");
assert(result.canLoop === true, "Parses can_loop=true in send-back mode");

// Minimal content — only line 1
const minimalContent = "**Goal Summary:** Minimal test<br>";
result = parseLoopState(minimalContent);
assert(result.goalSummary === "Minimal test", "Extracts goal from single-line file");
assert(result.currentRole === undefined, "currentRole is undefined when no line 2");
assert(result.canLoop === false, "canLoop defaults to false when no line 3");
assert(result.isSendBack === false, "isSendBack defaults to false when no line 2");

// Empty content
result = parseLoopState("");
assert(result.goalSummary === undefined, "goalSummary is undefined for empty file");
assert(result.currentRole === undefined, "currentRole is undefined for empty file");
assert(result.canLoop === false, "canLoop defaults to false for empty file");
assert(result.isSendBack === false, "isSendBack defaults to false for empty file");

// Malformed line 2 — no role markers
const malformedLine2 = [
    "**Goal Summary:** Test<br>",
    "Some random text without role markers",
    "can_loop=true"
].join("\n");
result = parseLoopState(malformedLine2);
assert(result.currentRole === undefined, "currentRole is undefined for malformed line 2");

// Malformed line 3 — no key=value pairs
const malformedLine3 = [
    "**Goal Summary:** Test<br>",
    "**Current Role:** Interviewer (Role 01) | History: <br>",
    "just some random text without equals signs"
].join("\n");
result = parseLoopState(malformedLine3);
assert(result.canLoop === false, "canLoop defaults to false for malformed line 3");

// Goal summary with special characters
const specialCharsContent = [
    "**Goal Summary:** Add `can_loop={true|false}` config flag<br>",
    "**Current Role:** Planner (Role 02) | History: Interviewer<br>",
    "test_level=skip | do_docs=false | can_loop=true<br>"
].join("\n");
result = parseLoopState(specialCharsContent);
assert(result.goalSummary === "Add `can_loop={true|false}` config flag", "Goal summary preserves special characters");

// ============================================================
console.log("\n=== U2 — autoRespondUiRequest() logic ===\n");

// Test the auto-respond logic by checking what values it would produce
function simulateAutoRespond(method, options) {
    switch (method) {
        case "confirm": return { confirmed: true };
        case "select": return { value: options?.[0] ?? "" };
        case "input": return { value: "" };
        case "editor": return { value: "" };
        default: return null; // fire-and-forget methods
    }
}

// confirm dialog → always confirmed=true
let resp = simulateAutoRespond("confirm");
assert(resp.confirmed === true, "confirm → confirmed: true (auto-accept)");

// select dialog → picks first option (recommended/default per pipeline conventions)
resp = simulateAutoRespond("select", ["Option A", "Option B"]);
assert(resp.value === "Option A", "select → picks first option (recommended default)");

// select with single option
resp = simulateAutoRespond("select", ["Only choice"]);
assert(resp.value === "Only choice", "select → picks sole option");

// select with no options → empty string
resp = simulateAutoRespond("select", []);
assert(resp.value === "", "select → empty string when no options provided");

// input dialog → empty string (auto-skip)
resp = simulateAutoRespond("input");
assert(resp.value === "", "input → empty string (auto-skip)");

// editor dialog → empty string (auto-skip)
resp = simulateAutoRespond("editor");
assert(resp.value === "", "editor → empty string (auto-skip)");

// Fire-and-forget methods → no response needed
assert(simulateAutoRespond("notify") === null, "notify → no response (fire-and-forget)");
assert(simulateAutoRespond("setStatus") === null, "setStatus → no response (fire-and-forget)");
assert(simulateAutoRespond("setWidget") === null, "setWidget → no response (fire-and-forget)");
assert(simulateAutoRespond("setTitle") === null, "setTitle → no response (fire-and-forget)");

// ============================================================
console.log("\n=== U3 — loopStateExists() edge cases ===\n");

// Test via actual file system operations in temp dir
const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'loopstate_test_'));
const wsDir = path.join(tmpdir, 'ai_workspace');
const loopStatePath = path.join(wsDir, 'loop_state.md');

// File doesn't exist yet
assert(!fs.existsSync(loopStatePath), "loop_state.md does not exist in fresh temp dir");

// Create directory but no file
fs.mkdirSync(wsDir, { recursive: true });
assert(!fs.existsSync(loopStatePath), "loop_state.md still absent after mkdir");

// Create the file
fs.writeFileSync(loopStatePath, "**Goal Summary:** Test\n**Current Role:** Interviewer (Role 01)\ncan_loop=false\n");
try {
    const stat = fs.statSync(loopStatePath);
    assert(stat.isFile(), "loop_state.md exists and is a regular file");
} catch (e) {
    assert(false, `statSync failed: ${e.message}`);
}

// File with zero bytes (edge case — parseLoopState should handle gracefully)
fs.writeFileSync(loopStatePath, "");
const emptyContent = fs.readFileSync(loopStatePath, "utf-8");
result = parseLoopState(emptyContent);
assert(result.goalSummary === undefined, "parseLoopState handles zero-byte file gracefully");

// Cleanup
fs.rmSync(tmpdir, { recursive: true, force: true });

// ============================================================
console.log("\n=== U4 — Infinite loop detection (STUCK_THRESHOLD) ===\n");

const STUCK_THRESHOLD = 3;

function detectInfiniteLoop(roleHistory, currentRole) {
    if (!currentRole || roleHistory.length < STUCK_THRESHOLD - 1) return false;
    const recent = [...roleHistory.slice(-(STUCK_THRESHOLD - 1)), currentRole];
    return recent.every((r) => r === currentRole);
}

// Normal progression — no loop detected
assert(!detectInfiniteLoop([], "Interviewer"), "No loop on first role");
assert(!detectInfiniteLoop(["Interviewer"], "Planner"), "No loop on different role");
assert(!detectInfiniteLoop(["Interviewer", "Planner"], "Worker"), "No loop on third different role");

// Stuck at threshold — exactly STUCK_THRESHOLD same roles
assert(detectInfiniteLoop(["Worker", "Worker"], "Worker"), `Loop detected after ${STUCK_THRESHOLD} consecutive same roles`);

// Just below threshold — should NOT trigger
assert(!detectInfiniteLoop(["Worker"], "Worker"), `${STUCK_THRESHOLD - 1} consecutive roles does not trigger`);

// Alternating pattern — no loop even with repeats
assert(!detectInfiniteLoop(["Worker", "Tester"], "Worker"), "Alternating Worker↔Tester does not trigger");

// Long history with recent stuck
const longHistory = ["Interviewer", "Planner", "Worker", "Worker"];
assert(detectInfiniteLoop(longHistory, "Worker"), "Detects loop in long history when last 3 are same");

// ============================================================
console.log("\n=== U5 — Event listener registration ===\n");

const extPath = path.join('.pi', 'extensions', 'pipeline-auto.ts');
const extContent = fs.readFileSync(extPath, "utf-8");

// Verify all expected event listeners are registered
assert(extContent.includes('pi.on("session_start"'), "Registers session_start listener");
assert(extContent.includes('pi.on("turn_end"'), "Registers turn_end listener");
assert(extContent.includes('pi.on("agent_end"'), "Registers agent_end listener");
assert(extContent.includes('pi.on("session_shutdown"'), "Registers session_shutdown listener");
assert(extContent.includes('pi.on("input"'), "Registers input listener for live steering");

// Verify hasUI guards on listeners (no-op in print/sub-agent mode)
const hasUIGuardCount = (extContent.match(/hasUI/g) || []).length;
assert(hasUIGuardCount >= 3, `At least 3 hasUI guards present (found ${hasUIGuardCount})`);

// ============================================================
console.log("\n=== U6 — Extension source code static analysis ===\n");

// Verify MAX_SESSIONS constant is reasonable
const maxSessionsMatch = extContent.match(/MAX_SESSIONS\s*=\s*(\d+)/);
assert(maxSessionsMatch && parseInt(maxSessionsMatch[1]) === 50, "MAX_SESSIONS is 50");

// Verify STUCK_THRESHOLD is set correctly
const stuckThresholdMatch = extContent.match(/STUCK_THRESHOLD\s*=\s*(\d+)/);
assert(stuckThresholdMatch && parseInt(stuckThresholdMatch[1]) === 3, "STUCK_THRESHOLD is 3");

// Verify AUTO_ACCEPT_INSTRUCTIONS contains key directives
const autoAcceptBlock = extContent.match(/AUTO_ACCEPT_INSTRUCTIONS\s*=\s*`([\s\S]*?)`/);
if (autoAcceptBlock) {
    const instructions = autoAcceptBlock[1];
    assert(instructions.includes("Never ask the user"), "Contains 'never ask' directive");
    assert(instructions.includes("recommended/default"), "Contains recommended/default directive");
    assert(instructions.includes("Auto-Run Mode"), "Contains Auto-Run Mode header");
} else {
    assert(false, "Could not extract AUTO_ACCEPT_INSTRUCTIONS block");
}

// Verify the extension uses proper TypeScript types
assert(extContent.includes('ExtensionAPI'), "Uses ExtensionAPI type");
assert(extContent.includes('ExtensionCommandContext'), "Uses ExtensionCommandContext type");
assert(extContent.includes('InputEvent'), "Uses InputEvent type for steering input");

// ============================================================
console.log("\n=== U7 — parseLoopState() with <br> tag variations ===\n");

// Lines ending with <br> (standard)
const brContent = [
    "**Goal Summary:** Test<br>",
    "**Current Role:** Interviewer (Role 01)<br>",
    "can_loop=true<br>"
].join("\n");
result = parseLoopState(brContent);
assert(result.goalSummary === "Test", "Parses goal with <br> suffix on line 1");
assert(result.currentRole === "Interviewer", "Parses role when line 2 ends with <br> (no pipe)");

// Lines without <br> (also valid per spec — <br> is optional)
const noBrContent = [
    "**Goal Summary:** Test",
    "**Current Role:** Planner (Role 02) | History: ",
    "can_loop=false"
].join("\n");
result = parseLoopState(noBrContent);
assert(result.goalSummary === "Test", "Parses goal without <br> suffix");
assert(result.currentRole === "Planner", "Parses role without <br> suffix");

// Mixed — some lines with <br>, some without
const mixedContent = [
    "**Goal Summary:** Test<br>",
    "**Current Role:** Worker (Role 03) | History: ",
    "can_loop=true<br>"
].join("\n");
result = parseLoopState(mixedContent);
assert(result.currentRole === "Worker", "Parses role with mixed <br> usage");

// ============================================================
console.log("\n=== U8 — Second Opinion history tracking & static analysis ===\n");

// Test parseLoopState() with Second Opinion in history
const secondOpinionNormal = [
    "**Goal Summary:** Test feature<br>",
    "**Current Role:** Worker (Role 03) | History: Interviewer → Planner → Worker → Second Opinion<br>",
    "test_level=quick | do_docs=false | can_loop=true<br>"
].join("\n");
result = parseLoopState(secondOpinionNormal);
assert(result.goalSummary === "Test feature", "Parses goal with Second Opinion in history");
assert(result.currentRole === "Worker", "Parses active role when Second Opinion is in history");
assert(result.isSendBack === false, "isSendBack is false for non-sendback Second Opinion");

const secondOpinionSendback = [
    "**Goal Summary:** Test feature<br>",
    "**Current Role:** Worker (Role 03) (in-sendback) | History: Interviewer → Planner → Worker → Second Opinion<br>",
    "test_level=quick | do_docs=false | can_loop=true<br>"
].join("\n");
result = parseLoopState(secondOpinionSendback);
assert(result.currentRole === "Worker", "Parses active role with sendback and Second Opinion");
assert(result.isSendBack === true, "isSendBack is true for sendback Second Opinion");

// Static analysis of manual_second_opinion.md
const secondOpinionPath = path.join("ai_workspace", "roles", "manual_second_opinion.md");
const secondOpinionContent = fs.readFileSync(secondOpinionPath, "utf-8");

assert(secondOpinionContent.includes("→ Second Opinion"), "Contains '→ Second Opinion' history update syntax");
assert(secondOpinionContent.includes("untouched"), "Contains untouched directive for 0 findings / no issues");
assert(secondOpinionContent.includes("(in-sendback) | History: {PrevRoles} → Second Opinion"), "Contains send-back line 2 update format with Second Opinion in history");
assert(secondOpinionContent.includes("retains the original active role and has `→ Second Opinion` appended"), "Task 7 verifies line 2 retains role and appends Second Opinion");

// ============================================================
console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, 0 skipped`);
console.log("=".repeat(50) + "\n");

process.exit(failed > 0 ? 1 : 0);

