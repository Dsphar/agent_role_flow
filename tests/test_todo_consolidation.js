/**
 * Static guards for the "Reduce TODO spam" loop: Warnings route to Worker via
 * send-back, Suggestions bundle into one consolidated manual-review file per loop.
 *
 * Mirrors test_sendback.js Section 9 style — string assertions against the
 * directive files (AGENTS.md + role/helper markdown) that template pipeline
 * behavior for all projects. These guards fail if future loops drift the
 * routing rules, drop the Worker doc-correction carve-out, or resurrect
 * per-item TODO creation for Warning/Suggestion findings.
 */

const fs = require("fs");
const path = require("path");

// Tests live in tests/ — project root is one level up (paths broke when files moved into tests/).
const ROOT = path.join(__dirname, "..");

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

const read = (relPath) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

const agentsMd = read("AGENTS.md");
const worker = read("ai_workspace/roles/03_worker.md");
const tester = read("ai_workspace/roles/04_tester.md");
const reviewer = read("ai_workspace/roles/06_reviewer.md");
const interviewer = read("ai_workspace/roles/01_interviewer.md");
const todoGuide = read("ai_workspace/skill_helpers/todo_guide.md");
const sendbackGuide = read("ai_workspace/skill_helpers/sendback_guide.md");

// ──────────────────────────────────────────────
// SECTION 1: AGENTS.md — Worker doc-correction carve-out + pinned strings
// ──────────────────────────────────────────────
console.log("\n=== Section 1: AGENTS.md shared-constraint carve-out ===");

assert(agentsMd.includes(
    "| Do not write project documentation (READMEs, API docs, usage guides) — exception: minimal factual corrections to existing docs/inline comments only when sent back a Warning-level doc-inaccuracy finding | Worker, Tester |"
), "Shared-constraints row carries the tight carve-out (corrections only, send-back-triggered, applies to Worker + Tester)");

assert(agentsMd.includes("can_loop={true|false}"), "Pinned: AGENTS.md format spec still includes can_loop key");
assert(agentsMd.includes("can_loop` must be `true` or `false`") ||
       agentsMd.includes("can_loop must be true or false"),
    "Pinned: AGENTS.md guardrail still names can_loop valid values");

// ──────────────────────────────────────────────
// SECTION 2: 03_worker.md — carve-out pointer in send-back section
// ──────────────────────────────────────────────
console.log("\n=== Section 2: Worker doc-correction permission ===");

assert(worker.includes("you may make minimal factual corrections to existing documentation or inline comments"),
    "Worker may correct docs/inline comments when sent back a Warning-level doc-inaccuracy finding");
assert(worker.includes("corrections only, no new content or restructuring"),
    "Carve-out scoped to corrections — no authoring/restructuring (Documenter lane preserved)");
assert(worker.includes("per the AGENTS.md shared-constraint carve-out"),
    "Worker file cross-references the AGENTS.md carve-out as source of truth");

// ──────────────────────────────────────────────
// SECTION 3: todo_guide.md — consolidated manual-review file mechanics
// ──────────────────────────────────────────────
console.log("\n=== Section 3: Consolidated Manual-Review Files (todo_guide) ===");

assert(todoGuide.includes("## Consolidated Manual-Review Files"),
    "Dedicated section exists for consolidated files");
assert(todoGuide.includes("TODO_manual_review_{slug}.md"),
    "Naming pattern TODO_manual_review_{slug}.md specified");
assert(todoGuide.includes("first up to 4 words of the Goal Summary"),
    "Deterministic slug derivation rule stated (≤4 words of line 1)");
assert(todoGuide.includes("only the Reviewer (Role 06) creates/updates this file during a loop"),
    "Single-writer rule: only Reviewer creates/updates mid-loop");
assert(todoGuide.includes("dedupe items rather than appending duplicates"),
    "Idempotent refresh with dedupe for send-back re-runs");
assert(todoGuide.includes("**Worked on**") && todoGuide.includes("**Dropped**") && todoGuide.includes("**Preserved**"),
    "All three disposition buckets named (worked on / dropped / preserved)");
assert(todoGuide.includes("the Worker never deletes them"),
    "Worker-deletion carve-out stated in Deletion responsibility");
assert(todoGuide.includes("Exempt from the Worker-deletion rule"),
    "Tracking Completion section carries the consolidated-file exemption");
assert(/One file per item\.[^\n]*except consolidated manual-review files/.test(todoGuide),
    "One-file-per-item rule has explicit consolidated-file exception clause");

// ──────────────────────────────────────────────
// SECTION 4: 01_interviewer.md — disposition walkthrough + pinned strings
// ──────────────────────────────────────────────
console.log("\n=== Section 4: Interviewer disposition workflow ===");

assert(interviewer.includes("(`TODO_manual_review_` prefix)"),
    "Consolidated-file trigger (prefix match) present in interview flow");
assert(interviewer.includes("#### Disposition Walkthrough (Consolidated Manual-Review Files)"),
    "Disposition walkthrough sub-step exists");
assert(interviewer.includes("**Worked on**") && interviewer.includes("**Dropped**") && interviewer.includes("**Preserved**"),
    "All three buckets named explicitly in the walkthrough");
assert(interviewer.includes("delete the file only when no items remain"),
    "Shrink-not-delete rule: file deleted only when empty");
assert(interviewer.includes("no Planner/Worker deletion step for this file"),
    "Interviewer owns consolidated-file lifecycle (no Worker deletion step)");

assert(interviewer.includes("can_loop=false"), "Pinned: Interviewer init template still includes can_loop=false");
assert(interviewer.includes("Always set `can_loop=false`"), "Pinned: 'Always set can_loop=false' instruction intact");

// ──────────────────────────────────────────────
// SECTION 5: 06_reviewer.md — severity routing rework
// ──────────────────────────────────────────────
console.log("\n=== Section 5: Reviewer routing (no per-item TODOs) ===");

assert(!reviewer.includes("Create TODO files silently for Warning and Suggestion items"),
    "Old auto-mode line ('Create TODO files silently...') removed");
assert(!/offer to make new todo files/i.test(reviewer),
    "Per-item TODO offer language gone from Reviewer file");
assert(reviewer.includes("No per-item TODO files for Warning or Suggestion findings."),
    "Explicit prohibition on per-item TODOs for Warning/Suggestion tiers");
assert(reviewer.includes("create or refresh a single consolidated manual-review file in `ai_workspace/TODO/` if at least one item exists"),
    "Consolidated file created only when ≥1 item exists (no empty files)");
assert(reviewer.includes("Tester's suggestions harvested from the Tester's summary section"),
    "Harvest channel: Reviewer reads Tester suggestions from loop_state.md summary");
assert(reviewer.includes("idempotent refresh with dedupe on send-back re-runs"),
    "Final Step mandates idempotent refresh (no duplicates across send-back cycles)");

// ──────────────────────────────────────────────
// SECTION 6: 06_reviewer.md — Warning send-back + doc-inaccuracy tiering
// ──────────────────────────────────────────────
console.log("\n=== Section 6: Reviewer Warning send-back + doc tiering ===");

assert(reviewer.includes("### Send-Back on Critical and Warning Issues"),
    "Send-back section covers both Critical and Warning tiers");
assert(reviewer.includes("Default to silent send-back for in-scope Critical and Warning issues."),
    "Auto-mode: silent send-back extends to Warnings (in-scope)");
assert(reviewer.includes("Critical → individual TODO; Warning → consolidated manual-review file tagged Warning"),
    "Out-of-scope routing per tier (Critical→individual, Warning→consolidated)");
assert(reviewer.includes("**Tiering rule:** Inaccurate documentation — including inline comments — is a **Warning** finding (not Suggestion)"),
    "Doc-inaccuracy tiering: inaccurate docs/inline comments = Warning (post-approval revision)");
assert(reviewer.includes('note "minimal factual correction" as the expected fix scope'),
    "Doc-inaccuracy send-back entries state minimal-correction fix scope");

// ──────────────────────────────────────────────
// SECTION 7: 04_tester.md — suggestion bundling + harvest channel
// ──────────────────────────────────────────────
console.log("\n=== Section 7: Tester suggestions feed consolidated file ===");

assert(!tester.includes("so user can reference items when creating TODOs"),
    "Old language (user creates per-item TODOs from suggestion list) removed");
assert(tester.includes("consolidated manual-review file at end of review"),
    "Tester knows Reviewer bundles suggestions into the consolidated file");
assert(tester.includes("Record every presented suggestion in your summary section in both interactive and auto modes"),
    "Both-modes summary recording mandate (Reviewer's harvest channel)");

// ──────────────────────────────────────────────
// SECTION 8: sendback_guide.md — Critical+Warning initiation, tiered deferral
// ──────────────────────────────────────────────
console.log("\n=== Section 8: Send-back guide routing ===");

assert(sendbackGuide.includes("#### Reviewer (Role 06) — Critical and Warning Issues"),
    "Reviewer initiation header covers Critical AND Warning issues");
assert(!sendbackGuide.includes("#### Reviewer (Role 06) — Critical Issues"),
    "Old Critical-only header removed");
assert(sendbackGuide.includes("individual TODO files remain valid for out-of-scope Criticals and Tester bug deferrals"),
    "Tier-dependent deferral targets: consolidated file vs individual TODO boundaries stated");
assert(sendbackGuide.includes("documentation edits are limited to the AGENTS.md minimal-factual-corrections carve-out (Warning-level doc-inaccuracy send-backs)"),
    "Guardrails blockquote updated for the Worker doc-correction carve-out");

// ──────────────────────────────────────────────
// SECTION 9: Cross-file consistency
// ──────────────────────────────────────────────
console.log("\n=== Section 9: Cross-file consistency ===");

assert(agentsMd.includes("minimal factual correction") && worker.includes("minimal factual correction"),
    "Carve-out phrase present in BOTH AGENTS.md and 03_worker.md (no wording drift)");

// Slug derivation rule must live in exactly one file (single source of truth).
const slugRuleFiles = [agentsMd, worker, tester, reviewer, interviewer, todoGuide, sendbackGuide]
    .filter((c) => c.includes("first up to 4 words"));
assert(slugRuleFiles.length === 1 && slugRuleFiles[0] === todoGuide,
    "Slug derivation rule stated once (todo_guide.md only) — no conflicting restatements");

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────
console.log("\n" + "═".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
console.log("═".repeat(50));

if (failed > 0) process.exit(1);
