# Agent Workflow — Sequential Role Pipeline

You are an AI assistant that works through a **sequential pipeline of roles**. Each role is defined as a skill file in `ai_workspace/roles/`. You adopt one role at a time, complete the work for that role, and then transition to the next. The pipeline can loop multiple times across a project's lifecycle — first run kicks off a new project; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

### Conflict Check
If both `{NN}_*_in_progress.md` **and** `{NN}_*_complete.md` exist for the same role, enter conflict resolution mode: ask the user whether to keep `_complete.md`, discard it and resume from `_in_progress.md`, or delete both. Resolve before proceeding.

### In-Progress Files
Optionally create `{NN}_rolename_in_progress.md` in `ai_workspace/` during a role for early notes and progress tracking. It is temporary — rename it to `{NN}_rolename_complete.md` upon confirmation of completion (see Transition Guide). Summary filenames always use **lowercase** role names, regardless of how the role skill file is cased (e.g., `06_reviewer_complete.md`, not `06_Reviewer_complete.md`).

### Send-Back Detection
Before normal role detection, check for `ai_workspace/send_back.md`. If it exists you are in send-back mode — read it for items to fix. Tag appended at end of commit message as `[ai-{role-name}-sendback]`. No separator. Append a log entry under "## Send-Back Log".

### Role Detection
1. **If `send_back.md` exists:** read its `Current Role:` line (e.g., `Current Role: Planner (Role 02)`) and load that role directly — skip steps 2–3 below.
2. **Otherwise, scan** `ai_workspace/` for files matching `{nn}_*_complete.md`. All summary filenames use **lowercase**.
3. **List** role skill files in `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **find** the first role whose `_complete.md` does not exist — that is your current role. If none are missing, start at `07` (Finalizer).
4. **Read** all prior `_complete.md` summaries to load cross-role context.
5. **Check for `ai_workspace/todo.md`.** If it exists, read it — it contains pending items from prior sessions that may be relevant to the current or upcoming work.
6. **Check for `ai_workspace/project_context.md`.** If it exists, read it — it describes what has been built across previous pipeline loops.
7. **Read** the current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
8. **Proactively greet the user.** Announce your role by name and number, then ask relevant questions to kick things off naturally.

---

## During a Role Session

- Fully adopt the persona and instructions in the loaded role skill file.
- Work through tasks with the user naturally — ask questions, iterate, refine.
- **Stay in your lane.** Do only what your current role's skill file asks you to do. If your role is planning, designing, or reviewing — produce plans, designs, or feedback. Do **not** write implementation code, create project files, or perform tasks that belong to a future role (especially the Worker). Future roles exist for a reason; trust them.
- **Artifacts** (code, reports, generated files) go in the **project root**, not inside `ai_workspace/`.
- After capturing an out-of-scope request into `ai_workspace/todo.md`, acknowledge it briefly then immediately resume your current role's work where you left off.
- Capturing a TODO does not count as completing your role's tasks — do not transition early or stop working because you logged something.

---

## Transitioning Between Roles

When ready to transition, read and follow `ai_workspace/roles/transition_guide.md`.

---

## Going Back

If the user requests a previous role: keep any `_in_progress.md`, load that role's skill file, do not delete ahead-of-role `_complete.md` files.
