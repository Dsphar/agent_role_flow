# External Changes Detection Guide

Full procedure for detecting and analyzing external (human-made) changes to the project before the Interviewer begins normal TODO scanning. This runs as a new startup step between "Project Overview Check" and "TODO Scanning."

---

## Phase 1 — Detection

### Step 1: Check Uncommitted Changes
Run `git diff --name-only`. If output is non-empty, record the list of unstaged/modified files for later presentation. Do **not** block — uncommitted changes are noted but not treated as an error.

### Step 2: Find the `[ai-pipeline]` Anchor Commit
Run `git log --format="%H %s" -20 | grep "\[ai-pipeline\]" | head -1`.

- **If a match is found:** Extract the commit hash. This is your anchor — all commits *after* this point are candidates for external changes.
- **If no match exists (first loop ever):** Skip external changes detection entirely. Proceed directly to TODO scanning. The absence of any `[ai-pipeline]` commit means no prior AI pipeline work has been finalized, so there's nothing to compare against.

### Step 3: Scan Commits Since the Anchor
Run `git log --format="%H %s" <anchor-hash>..HEAD`. Each line is a commit made after the last squashed pipeline loop. Collect all commit hashes and subjects, **filtering out any lines containing `[ai-pipeline]`** — those represent finalized prior loops (squashed by Finalizer), not external human changes.

- **If no commits found:** No external changes since last loop. Proceed directly to TODO scanning silently — do not mention this to the user.
- **If commits found:** Proceed to Phase 2 (Analysis).

---

## Phase 2 — Analysis

### Step 4: Read Changed Files
For each commit identified in Phase 1, run `git diff --name-only <prev-hash> <commit-hash>` to get per-commit file lists. Deduplicate across all commits into a single set of changed files.

Read the current contents of each changed file (use `read` tool). For small diffs, also inspect `git diff <prev-hash> <commit-hash> -- <file>` for targeted context.

### Step 5: Cross-Reference with Project Overview
Read `ai_workspace/project_overview.md`. Map changed files against the project's known structure and architecture. Note which modules/components were touched and whether changes align with or diverge from existing design decisions.

### Step 6: Infer Intent and Impact
Based on file contents, commit messages, and project context, determine:
- **What was changed:** Brief description of each modification (e.g., "Added auth middleware to API routes").
- **Likely purpose:** Why the change was made (inferred from code patterns, comments, commit subjects).
- **Project impact:** Which existing features or modules may be affected. Note any potential conflicts with planned AI pipeline work.

---

## Phase 3 — Presentation

### Step 7: Present Findings to User
Format the summary clearly:

```
I detected external changes since the last AI pipeline loop:

**Commits found:** N commit(s)
**Files changed:** <list of files, one per line>

**Summary of changes:**
- <inferred change description 1>
- <inferred change description 2>
...

**Uncommitted changes:** <list if any, or "None">
```

Keep the summary concise — aim for under 10 lines total. If there are many files, group by module/component rather than listing individually.

### Step 8: Present User Options
Offer three paths:

1. **Quick analysis loop (recommended)** — Skip Planner and Worker. Run a streamlined loop: optional Tester → optional Documenter → Reviewer → Finalizer. This validates the external changes against project standards without rebuilding anything.
2. **Normal full pipeline** — Proceed with all roles from Interviewer through Finalizer. Use this if you want to scope new work on top of the detected changes.
3. **Pick an existing TODO** — Ignore the external changes for now and tackle a pending TODO item instead.

Present as: "Quick analysis loop (recommended), normal full pipeline, or pick an existing TODO?"

---

## Phase 4 — Routing

### If User Chooses Quick Analysis Loop

1. **Auto-generate Goal Summary:** `External change analysis: {<100 char summary of detected changes>}`. Keep the summary portion under 100 characters total (including "External change analysis: ").
2. **Set pipeline config on line 3:** `test_level=quick | do_docs=true` (default — adjust if user requests otherwise).
3. **Create `loop_state.md`:**
   ```
   **Goal Summary:** External change analysis: {summary}<br>
   **Current Role:** Tester (Role 04) | History: Interviewer<br>
   **Pipeline Config:** test_level=quick | do_docs=true<br>
   ```
4. Skip Planner and Worker — hand off directly to Tester. The Interviewer's summary section in `loop_state.md` should document what was detected so downstream roles have context.

### If User Chooses Normal Full Pipeline

Proceed normally. The external changes are noted in the Interviewer's summary but do not alter pipeline flow. Continue with standard questioning, scoping, and handoff to Planner.

### If User Picks an Existing TODO

Note the external changes briefly in your summary for awareness, then proceed with normal TODO handling (validation, presentation, clarification questions).

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No git repository detected | Skip detection entirely. Proceed to TODO scanning. Note "No git repo" if user asks. |
| First loop ever (no `[ai-pipeline]` commits) | Skip detection entirely. There is no prior AI work to compare against. |
| Only uncommitted changes (no new commits since anchor) | Present uncommitted files in Phase 3 but do not offer the quick analysis loop — there's nothing finalized to review. Proceed to TODO scanning after noting them. |
| Mix of `[ai-pipeline]` and non-`[ai-pipeline]` commits since anchor | Only consider non-`[ai-pipeline]` commits as external. `[ai-pipeline]` commits are from prior completed loops (squashed by Finalizer) and represent finalized work, not new external changes. |
| User says "ignore" or "proceed anyway" | Acknowledge briefly, note in summary, proceed to TODO scanning without further analysis. |
