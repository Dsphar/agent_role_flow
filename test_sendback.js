/**
 * Send-back re-test for pipeline-auto extension fixes.
 * Covers: (1) Reviewer's 3 send-back issues, (2) full regression of original tests.
 */

const fs = require("fs");
const path = require("path");

let passed = 0;
let failed = 0;
let skipped = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.log(`  ✗ FAIL: ${label}`);
        failed++;
    }
}

// ──────────────────────────────────────────────
// SECTION 1: Reviewer Send-Back Issue #1 — Typos fixed in LLM-facing strings
// ──────────────────────────────────────────────
console.log("\n=== Section 1: Typo fixes (Reviewer send-back #1) ===");

const extPath = path.join(".pi", "extensions", "pipeline-auto.ts");
const extContent = fs.readFileSync(extPath, "utf-8");

// Check AUTO_ACCEPT_INSTRUCTIONS for typos
assert(!extContent.includes("recoommended"), 'AUTO_ACCEPT_INSTRUCTIONS: no "recoommended" typo');
assert(!extContent.includes("instruciton"), 'AUTO_ACCEPT_INSTRUCTIONS: no "instruciton" typo');
assert(!extContent.includes("rememeber"), 'AUTO_ACCEPT_INSTRUCTIONS: no "rememeber" typo');

// Check runSubAgent user message for typos
assert(!extContent.includes("recomendations"), 'runSubAgent message: no "recomendations" typo');
assert(!extContent.includes("wihtout"), 'runSubAgent message: no "wihtout" typo');

// Verify correct spellings are present (not just typos removed, but words exist)
const autoAcceptBlock = extContent.match(/AUTO_ACCEPT_INSTRUCTIONS\s*=\s*`([\s\S]*?)`/);
if (autoAcceptBlock) {
    assert(autoAcceptBlock[1].includes("recommended"), 'AUTO_ACCEPT_INSTRUCTIONS contains correct "recommended"');
} else {
    skipped++; console.log("  ⊘ Could not extract AUTO_ACCEPT_INSTRUCTIONS block");
}

// ──────────────────────────────────────────────
// SECTION 2: Reviewer Send-Back Issue #2 — Busy-wait replaced with async sleep
// ──────────────────────────────────────────────
console.log("\n=== Section 2: Busy-wait replacement (Reviewer send-back #2) ===");

assert(!extContent.includes("while (Date.now()"), "No busy-wait while(Date.now()) loop present");
assert(extContent.includes('await new Promise((resolve) => setTimeout(resolve, 1500))'),
    "Async sleep with setTimeout/Promise is used instead");
assert(extContent.match(/async\s+function\s+handler/), "Handler function is declared async (needed for await)");

// ──────────────────────────────────────────────
// SECTION 3: Reviewer Send-Back Issue #3 — Guard message wording updated
// ──────────────────────────────────────────────
console.log("\n=== Section 3: Guard message wording (Reviewer send-back #3) ===");

assert(extContent.includes("The Planner has not yet enabled auto-looping"),
    "Guard message references 'Planner' (not 'Worker')");
assert(!extContent.includes("The pipeline must reach Worker first"),
    "Old guard message ('reach Worker first') removed");

// ──────────────────────────────────────────────
// SECTION 4: Regression — Regex fix for getCurrentRole()
// ──────────────────────────────────────────────
console.log("\n=== Section 4: Regression — Regex fix (original tests) ===");

// Replicate the regex from pipeline-push.ts
function testGetCurrentRole(line2Raw) {
    let line2 = line2Raw.replace(/<br>\s*$/, "");
    const match = line2.match(/\*\*Current Role:\*\*\s*(.+?)(?:\s+(?:\(in-sendback\)\s+)?\(Role\s+\d+\)|\s+\|)/i);
    return match ? match[1].trim() : undefined;
}

// Single-word role name
assert(testGetCurrentRole("**Current Role:** Interviewer (Role 01) | History: ...") === "Interviewer",
    "Extract single-word role 'Interviewer'");

// Multi-word role name
assert(testGetCurrentRole("**Current Role:** Code Reviewer (Role 06) | History: ...") === "Code Reviewer",
    "Extract multi-word role 'Code Reviewer'");

// Role with (in-sendback) suffix
assert(testGetCurrentRole("**Current Role:** Tester (Role 04) (in-sendback) | History: ...") === "Tester",
    "Extract role with (in-sendback) suffix — returns just name");

// Another multi-word + in-sendback
assert(testGetCurrentRole("**Current Role:** Project Manager (Role 03) (in-sendback) | History: A → B") === "Project Manager",
    "Extract multi-word role with (in-sendback) suffix");

// Edge case: role name at end of line without pipe (should still match via (Role NN))
assert(testGetCurrentRole("**Current Role:** Finalizer (Role 07)") === "Finalizer",
    "Extract role when no History pipe present");

// Edge case: extra spaces around role name
assert(testGetCurrentRole("**Current Role:**  Worker  (Role 03) | History: ...") === "Worker",
    "Handle extra whitespace around role name");

// Edge case: lowercase markers
assert(testGetCurrentRole("**current role:** Planner (role 02) | history: ...") === "Planner",
    "Case-insensitive match on markers");

// ──────────────────────────────────────────────
// SECTION 5: Regression — parseCanLoop() logic
// ──────────────────────────────────────────────
console.log("\n=== Section 5: Regression — parseCanLoop() (original tests) ===");

function testParseCanLoop(line3Raw) {
    let line3 = line3Raw.replace(/<br>\s*$/, "");
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

assert(testParseCanLoop("test_level=quick | do_docs=no | can_loop=true") === true,
    "parseCanLoop returns true for can_loop=true");
assert(testParseCanLoop("test_level=deep | do_docs=yes | can_loop=false") === false,
    "parseCanLoop returns false for can_loop=false");
assert(testParseCanLoop("can_loop=true | test_level=quick | do_docs=no") === true,
    "parseCanLoop finds key in different position (first)");

// Edge cases
assert(testParseCanLoop("test_level=quick | do_docs=no") === false,
    "parseCanLoop returns false when can_loop key absent");
assert(testParseCanLoop("can_loop=yes") === false,
    "parseCanLoop returns false for unrecognized value 'yes'");
assert(testParseCanLoop("") === false,
    "parseCanLoop returns false for empty line");

// ──────────────────────────────────────────────
// SECTION 6: Regression — Command rename verification
// ──────────────────────────────────────────────
console.log("\n=== Section 6: Regression — Command rename (original tests) ===");

assert(extContent.includes('pi.registerCommand("pipeline-auto"'), "registerCommand uses 'pipeline-auto' name");
assert(!extContent.includes("/autoloop"), "No '/autoloop' references remain in file");
assert(!extContent.includes('"autoloop"') && !extContent.includes("'autoloop'"),
    'No bare "autoloop" string remains');

// ──────────────────────────────────────────────
// SECTION 7: Regression — can_loop guard logic
// ──────────────────────────────────────────────
console.log("\n=== Section 7: Regression — can_loop guard (original tests) ===");

assert(extContent.includes("if (!parseCanLoop(cwd))"), "Guard checks parseCanLoop before proceeding");
const guardBlock = extContent.match(/if\s*\(\s*!parseCanLoop\(cwd\)\s*\)\s*\{[\s\S]*?return;/);
assert(guardBlock !== null, "Guard has early return when can_loop is false");

// ──────────────────────────────────────────────
// SECTION 8: Regression — turn_end listener + session_start
// ──────────────────────────────────────────────
console.log("\n=== Section 8: Regression — Event listeners (original tests) ===");

assert(extContent.includes('pi.on("turn_end"'), "Registered turn_end event listener");
assert(extContent.includes('pi.on("session_start"'), "Registered session_start event listener");
assert(extContent.includes("c?.hasUI") || extContent.includes("ctx.hasUI"), "Listeners guard behind hasUI check");

// ──────────────────────────────────────────────
// SECTION 9: AGENTS.md and role files still correct
// ──────────────────────────────────────────────
console.log("\n=== Section 9: Regression — AGENTS.md + role files ===");

const agentsMd = fs.readFileSync("AGENTS.md", "utf-8");
assert(agentsMd.includes("can_loop={true|false}"), "AGENTS.md format spec includes can_loop key");
assert(agentsMd.includes("can_loop` must be `true` or `false`") ||
       agentsMd.includes("can_loop must be true or false"),
    "AGENTS.md guardrail mentions can_loop valid values");

const interviewer = fs.readFileSync("ai_workspace/roles/01_interviewer.md", "utf-8");
assert(interviewer.includes("can_loop=false"), "Interviewer role init template includes can_loop=false");

const planner = fs.readFileSync("ai_workspace/roles/02_planner.md", "utf-8");
assert(planner.includes("can_loop=true"), "Planner role has task to set can_loop=true");

// ──────────────────────────────────────────────
// SECTION 10: Old extension file removed
// ──────────────────────────────────────────────
console.log("\n=== Section 10: File structure ===");

assert(!fs.existsSync(path.join(".pi", "extensions", "auto-loop.ts")),
    "Old auto-loop.ts file does not exist (renamed)");
assert(fs.existsSync(extPath), "New pipeline-auto.ts exists at correct path");

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log("\n" + "═".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
console.log("═".repeat(50));

if (failed > 0) process.exit(1);
