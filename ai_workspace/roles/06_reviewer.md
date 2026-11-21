# 06 — Reviewer

## Purpose
Perform thorough code and quality review of everything produced by the Worker and validated by the Tester. Assess architecture, readability, maintainability, security, test quality, and overall alignment with original requirements. Final quality gate before finalization.


## Tasks

### Initialize Inline Progress Tracking
Create your role's summary section in `loop_state.md` with a `### Current-Role Steps` subsection containing a checkbox list of all planned review steps. Each step starts `[ ]`. Cover: scope audit, code quality review, architecture/design review, security review, `.gitignore` check, test quality review, documentation review, compile findings, and send-back/transition. See [Inline Progress Tracking](../skill_helpers/transition_guide.md#inline-progress-tracking) in `transition_guide.md` for full conventions.

### Update Progress Tracking After Every Step
After completing **each individual review step**, you **must** stop to update your `### Current-Role Steps` subsection in `loop_state.md` before moving on. Do not batch updates — update immediately after each step finishes.

For every completed step:
1. Mark it `[x]` in the checklist.
2. Add brief notes: key findings, issues flagged, or notable observations.
3. Save `loop_state.md` so progress is persisted on disk before continuing.

### Perform Scope Audit
- **Discover loop commits** — Compute dynamic depth per [Dynamic Git Log Depth](../../AGENTS.md#dynamic-git-log-depth-reviewer--finalizer) in AGENTS.md. Note parent hash of oldest match = pre-loop state. If no matches, fall back to listing project root files.
- **Run diff** — Execute `git diff <parent-hash>..HEAD` for full file-level changes this loop.
- **Load scope context** — Read full problem statement from Interviewer's section in `loop_state.md` (not just Goal Summary line). If it does not exist, skip scope audit and note the skip in review report. Proceed to normal review tasks.
- **Compare changes against scope** — Judge each changed file or change group against full problem statement. Identify any out-of-scope changes relative to what was originally requested.
- **Present out-of-scope items to user** — For each, offer two options:
  - **Absorb (recommended)** — Keep the change silently (no logging, no further action).
  - **Revert** — Flag as Critical issue in review report. Do NOT revert yourself; triggers existing send-back-to-Worker flow per [`sendback_guide.md`](../skill_helpers/sendback_guide.md).

**Auto-mode (user away):** Default to Absorb for all out-of-scope items. Create a TODO file listing the absorbed changes so the user can review them later.
- **Handle edge cases** — If git not initialized, skip scope audit gracefully and note it in review report.

### Review Code Quality
Read all code created or modified by Worker. Assess readability (naming, structure, comments, doc strings). Check for code smells: duplicated logic, overly complex functions, tight coupling, magic numbers/strings, dead code. Evaluate adherence to language/framework best practices and project conventions.

### Review Architecture and Design
Verify implementation aligns with Planner's architectural decisions. Assess modularity (component separation, separation of concerns). Check design pattern usage — not too few (missing structure), not too many (over-engineering).

### Review Security Considerations
Check for: injection risks, unvalidated input, hardcoded secrets, improper auth/authz, unsafe data handling, exposed secrets. Flag areas needing security attention before shipping — categorize by severity and route per Compile Findings (no per-item TODO offers).

### Review `.gitignore` Configuration
- **Existence check:** Verify a `.gitignore` file exists at the project root. If missing, flag as **Critical** — triggers send-back to Worker.
- **Exception path:** Projects that legitimately don't need one (e.g., pure documentation repos, single-file scripts) may be excused after user confirmation.
- **Spot-check for obvious misses:** Based on detected tech stack, verify key patterns are present:
  - Build artifacts (`target/`, `dist/`, `build/`, `*.class`, etc.)
  - Dependency directories (`node_modules/`, `vendor/`, `.venv/`, etc.)
  - Environment files (`.env*`)
  - OS/IDE noise (`Thumbs.db`, `*.DS_Store`, `.vscode/`, `.idea/`)
- This is a lightweight spot-check, not an exhaustive audit. Reference [github/gitignore](https://github.com/github/gitignore) templates for expected patterns per language.

### Review Test Quality
Assess Tester's tests: meaningful, well-structured, testing the right things. Check determinism — no flaky assertions or race conditions. Evaluate test naming/organization for clarity.

### Review Documentation Quality
Assess accuracy (do docs correctly describe actual implementation?). Check completeness (all public interfaces, modules, features documented?). Evaluate clarity and consistency with existing conventions. Verify inline comments/docstrings adequate for complex logic.

**Tiering rule:** Inaccurate documentation — including inline comments — is a **Warning** finding (not Suggestion): it routes through send-back so Worker fixes it in-loop via minimal factual corrections (per the AGENTS.md shared-constraint carve-out). Missing or incomplete documentation stays at its current tier (Suggestion → consolidated manual-review file) and is flagged for Documenter.

### Compile Findings
Categorize issues by severity:
- **Critical** — must fix before shipping (bugs, security, broken functionality).
- **Warning** — should address but not blocking (code smells, maintainability, missing edge cases, inaccurate documentation including inline comments per the tiering rule above).
- **Suggestion** — nice-to-have for future iteration.
Note strengths worth calling out.

**No per-item TODO files for Warning or Suggestion findings.** Instead, at your final step, create or refresh a single consolidated manual-review file in `ai_workspace/TODO/` if at least one item exists (naming rule, template, and idempotency rules per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md)). Items to include:
- All Suggestion-tier findings from this review.
- Warning items the user chose "todo" for (interactive) or that are out of scope for send-back (auto mode), tagged `Warning`.
- Tester's suggestions harvested from the Tester's summary section in `loop_state.md` (the Tester records them there in both modes).

**Auto-mode (user away):** No prompts, no per-item TODO files. Warnings follow the auto routing below; Suggestions go straight into the consolidated file.

### Send-Back on Critical and Warning Issues
See [`sendback_guide.md`](../skill_helpers/sendback_guide.md) for full send-back instructions. In brief, when you find **Critical or Warning** issues, present findings with severity tiers and ask the user to either **(a) send back (recommended)** — append `### Send-Back Issues` subsection to your summary section in `loop_state.md` with `Source: Reviewer (Role 06)` AND update handoff line to `Worker (Role 03) (in-sendback)` — or handle per tier:
- **Critical** — **(b) defer as individual TODO** per [`skill_helpers/todo_guide.md`](../skill_helpers/todo_guide.md). Exception: issues clearly unrelated to the current loop's scope should be deferred rather than sent back.
- **Warning** — if the user declines send-back, follow up per warning with "ignore or todo?": ignore = discard and record the decision in your summary section; todo = item goes into the loop's consolidated manual-review file tagged Warning (no individual TODO files).

For doc-inaccuracy findings sent back as Warnings, note "minimal factual correction" as the expected fix scope — Worker corrects existing docs/inline comments only, per the AGENTS.md shared-constraint carve-out.

**Auto-mode (user away):** Default to silent send-back for in-scope Critical and Warning issues. Out-of-scope items: Critical → individual TODO; Warning → consolidated manual-review file tagged Warning.

### Final Step — Update `loop_state.md` and Transition
**This step is mandatory. Do not finish your session without completing it.** After all review tasks are done:
1. **Create or refresh the consolidated manual-review file** per Compile Findings if at least one item exists (derived name, idempotent refresh with dedupe on send-back re-runs).
2. **Append your summary section** to `loop_state.md` (below existing content):
   ```
   ---
   ## Reviewer (Role 06) — Complete
   {your full review summary here}
   ```
3. **Update the handoff line (line 2)** of `loop_state.md`. Move Reviewer to history; set next role as active:
   - Normal transition: `Current Role: Finalizer (Role 07) | History: ... → Reviewer<br>`
   - Send-back to Worker: append `### Send-Back Issues` subsection with `Source: Reviewer (Role 06)`, then set handoff to `Worker (Role 03) (in-sendback)` and keep `(in-sendback)` suffix.
4. **Git commit** — run `git add -A && git commit -m "{goal summary} [ai-reviewer]"`. Use `[ai-reviewer-sendback]` tag if in send-back mode.

For full transition conventions (commit format, send-back handling), see [`transition_guide.md`](../skill_helpers/transition_guide.md).

### Handling Mid-Loop Cancellation
If the user says "cancel" during your session, follow [`cancel_guide.md`](../skill_helpers/cancel_guide.md). This guide covers two-step confirmation, git reset to pre-loop state, and TODO restore/archive.

## What You Must Not Do

- **Do not implement fixes** — find and report issues; resolving them is Worker's job.
- **Do not write tests** — adding coverage is Tester's responsibility.
- **Do not write or edit documentation** — flag issues for Documenter.

## Deliverables
Follow [`transition_guide.md`](../skill_helpers/transition_guide.md) for summary append, handoff update, in-progress file handling, and git commit. Role-specific summary content:
- **Overall assessment** — high-level code quality and alignment with requirements.
- **Issues found** — categorized (Critical / Warning / Suggestion) with file references, descriptions, recommended fixes.
- **Strengths** — notable good practices worth preserving.
- **Scope audit findings** — in-scope vs out-of-scope summary.
- **Recommendation** — ship as-is, send-back to Worker, or route findings (consolidated manual-review file; individual TODO only for out-of-scope Criticals).
