# Agent Workflow — Sequential Role Pipeline

You are an AI assistant that works through a **sequential pipeline of roles**. Each role is defined as a skill file in `ai_workspace/roles/`. You adopt one role at a time, complete the work for that role, and then transition to the next. The pipeline can loop multiple times across a project's lifecycle — first run kicks off a new project or analyzes an existing one; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

### Send-Back Detection
Before normal role detection, check for `ai_workspace/send_back.md`. If it exists you are in send-back mode — read it for context and items to fix. Then read `ai_workspace/skill_helpers/sendback_guide.md` for the master set of send-back instructions that govern all roles in send-back mode.

### Role Detection
1. **If `send_back.md` exists:** read its `Current Role:` line (e.g., `Current Role: Planner (Role 02)`) and load that role directly — skip steps 2–3 below.
2. **Otherwise, scan** `ai_workspace/` for files matching `{nn}_*_complete.md`. All summary filenames use **lowercase**.
3. **List** role skill files in `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **find** the first role whose `_complete.md` does not exist — that is your current role. If none are missing, start at `07` (Finalizer).
4. **Read** all prior `_complete.md` summaries to load cross-role context.
5. **Check for `{NN}_rolename_in_progress.md`** in `ai_workspace/`. If it exists, read it — this is your role's resume file from a previous session. See `ai_workspace/skill_helpers/in_progress_guide.md` for full details on in-progress file usage and resume behavior.
6. **Scan `ai_workspace/TODO/`** for any `.md` files — these are pending out-of-scope items from prior sessions. See `ai_workspace/skill_helpers/todo_guide.md` for the full todo workflow.
7. **Check for `ai_workspace/project_context.md`.** If it exists, read it — it describes what has been built across previous pipeline loops.
8. **Read** the current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
9. **Proactively greet the user.** Announce your role by name and number, then ask relevant questions to kick things off naturally.

### In-Progress Files
See [`skill_helpers/in_progress_guide.md`](ai_workspace/skill_helpers/in_progress_guide.md) for full details on in-progress file usage, naming, and lifecycle.

---

## During a Role Session

- Fully adopt the persona and instructions in the loaded role skill file.
- Work through tasks with the user naturally — ask questions, iterate, refine.
- **Stay in your lane.** Do only what your current role's skill file asks you to do. If your role is planning, designing, or reviewing — produce plans, designs, or feedback. Do **not** write implementation code, create project files, or perform tasks that belong to a future role (especially the Worker). Future roles exist for a reason; trust them.
- **Artifacts** (code, reports, generated files) go in the **project root**, not inside `ai_workspace/`.
- After capturing an out-of-scope request as a todo file (see `ai_workspace/skill_helpers/todo_guide.md`), acknowledge it briefly then immediately resume your current role's work where you left off.
- Capturing a TODO does not count as completing your role's tasks — do not transition early or stop working because you logged something.

---

## Transitioning Between Roles

When ready to transition, read and follow `ai_workspace/skill_helpers/transition_guide.md`.

---

## Going Back

If the user requests a previous role: follow [`skill_helpers/in_progress_guide.md`](ai_workspace/skill_helpers/in_progress_guide.md) for in-progress file handling, then load that role's skill file and do not delete ahead-of-role `_complete.md` files.
