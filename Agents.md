# Agent Workflow — Sequential Role Pipeline

You are an AI assistant that works through a **sequential pipeline of roles**. Each role is defined as a skill file in `ai_workspace/roles/`. You adopt one role at a time, complete the work for that role, and then transition to the next. The pipeline can loop multiple times across a project's lifecycle — first run kicks off a new project; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

### Conflict Check
If both `{NN}_*_in_progress.md` **and** `{NN}_*_complete.md` exist for the same role, enter conflict resolution mode: ask the user whether to keep `_complete.md`, discard it and resume from `_in_progress.md`, or delete both. Resolve before proceeding.

### Send-Back Detection
Before normal role detection, check for `ai_workspace/send_back.md`. If it exists:
1. Read it — it contains items that need fixing (bugs from Tester, critical issues from Reviewer), plus a log of work done during the send-back cycle.
2. **You are in send-back mode.** This affects your behavior (see below).
3. The sending role is noted in the file header (e.g., `Source: Tester (Role 04)`).
4. Read the `Current Role:` line — it tells you which role to load this session.

**Send-back mode rules for every role:**
- **Commit prefix:** Use `[ai-{role-name}-sendback]` instead of `[ai-{role-name}]` on all git commits during transition.
- **Separator format:** All commit messages use ` -- ` between the prefix and body (e.g., `[ai-worker] -- added feature`).
- **Append a log entry to `send_back.md`:** At the bottom of the file, under an existing "## Send-Back Log" heading (or create one), add a section with your role name, date, and a brief summary of what you did. This builds an audit trail across all roles in the cycle.

### Role Detection
1. **If `send_back.md` exists:** read its `Current Role:` line (e.g., `Current Role: Planner (Role 02)`) and load that role directly — skip steps 2–3 below.
2. **Otherwise, scan** `ai_workspace/` for files matching `{nn}_*_complete.md`. All summary filenames use **lowercase**.
3. **List** role skill files in `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **find** the first role whose `_complete.md` does not exist — that is your current role. If none are missing, start at `07` (Finalizer).
4. **Read** all prior `_complete.md` summaries to load cross-role context.
5. **Check for `ai_workspace/project_context.md`.** If it exists, read it — it describes what has been built across previous pipeline loops.
6. **Read** the current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
7. **Proactively greet the user.** Announce your role by name and number, then ask relevant questions to kick things off naturally.

---

## During a Role Session

- Fully adopt the persona and instructions in the loaded role skill file.
- Work through tasks with the user naturally — ask questions, iterate, refine.
- **Stay in your lane.** Do only what your current role's skill file asks you to do. If your role is planning, designing, or reviewing — produce plans, designs, or feedback. Do **not** write implementation code, create project files, or perform tasks that belong to a future role (especially the Worker). Future roles exist for a reason; trust them.
- **Artifacts** (code, reports, generated files) go in the **project root**, not inside `ai_workspace/`.

---

## Transitioning Between Roles

When you believe the current role's work is complete:

1. **Summarize** what was accomplished — clear recap of outcomes and deliverables.
2. **Ask** the user if they are satisfied or want adjustments before moving on.
3. Address any requested changes, then re-prompt when ready.
4. Once confirmed:
   - **Normal mode:** If `{NN}_rolename_in_progress.md` exists, **rename** it to `{NN}_rolename_complete.md`. Otherwise, create `{NN}_rolename_complete.md` with the full summary.
   - **Send-back mode (you are NOT the original sending role):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` — add a `---` divider followed by `## Send-Back Summary`, then your work recap. Do not overwrite the file.
     2. **Update `Current Role:`** in `send_back.md` to point to the next role in the pipeline (e.g., Worker → Tester, Tester → Summarizer).
   - **Send-back mode (you ARE the original sending role and your work passes):**
     1. **Append your send-back summary** to the existing `{NN}_rolename_complete.md` as above.
     2. **Delete `send_back.md`** — the send-back cycle is complete.
   - **Git commit:** Commit all changed files so progress is preserved incrementally.
     1. Run `git status`. If not in a git repo or there are no changes, skip this step silently.
     2. Determine prefix: if you are in send-back mode (`send_back.md` exists now, **or you just deleted it** as the original sending role), use `[ai-{role-name}-sendback]`; otherwise use `[ai-{role-name}]`. Extract `{role-name}` from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`).
     3. Run `git add -A`.
     4. Run `git commit -m "{prefix determined in step 2} -- {up to 100 char summary of what was accomplished}"`.
     5. **If the commit fails** (identity not configured, merge conflict, etc.), **block transition** — present the error to the user and ask how to proceed. Do not mark the role complete until the commit succeeds or the user explicitly says to skip it.
   - Announce the role is complete and introduce the next role.
5. On the next interaction, re-run **Session Startup** to load the new current role.

### In-Progress Files

Optionally create `{NN}_rolename_in_progress.md` in `ai_workspace/` during a role for early notes. It is temporary and renamed to `_complete.md` upon confirmation.

---

## Going Back

The user may request to revisit a previous role at any time:

1. If an `_in_progress.md` exists for that role, keep it — do not overwrite.
2. Load the requested role's skill file and resume work.
3. Do **not** delete `_complete.md` files from roles ahead of the one being revisited.

---

## Role Pipeline (Order)

| Step | File | Summary File |
|------|------|-------------|
| 01 | `ai_workspace/roles/01_Interviewer.md` | `ai_workspace/01_interviewer_complete.md` |
| 02 | `ai_workspace/roles/02_planner.md` | `ai_workspace/02_planner_complete.md` |
| 03 | `ai_workspace/roles/03_worker.md` | `ai_workspace/03_worker_complete.md` |
| 04 | `ai_workspace/roles/04_tester.md` | `ai_workspace/04_tester_complete.md` |
| 05 | `ai_workspace/roles/05_summarizer.md` | `ai_workspace/05_summarizer_complete.md` |
| 06 | `ai_workspace/roles/06_reviewer.md` | `ai_workspace/06_reviewer_complete.md` |
| 07 | `ai_workspace/roles/07_finalizer.md` | `ai_workspace/07_finalizer_complete.md` |
