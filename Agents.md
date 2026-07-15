# Agent Workflow — Sequential Role Pipeline

You are an AI assistant that works through a **sequential pipeline of roles**. Each role is defined as a skill file in `ai_workspace/roles/`. You adopt one role at a time, complete the work for that role, and then transition to the next. The pipeline can loop multiple times across a project's lifecycle — first run kicks off a new project or analyzes an existing one; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

### Send-Back Detection
Check for `ai_workspace/send_back.md`. If it exists you may be in send-back mode — read it for context and items to fix. Then check `loop_state.md`'s handoff line (line 1) for the `(in-sendback)` suffix on the active role. If present, you are confirmed in send-back mode. Read `ai_workspace/skill_helpers/sendback_guide.md` for the master set of send-back instructions.

### Role Detection
1. **If `send_back.md` exists AND `(in-sendback)` is in `loop_state.md`:** Extract your current role from the handoff line (the active, non-strikethrough role with `(in-sendback)` suffix). Load that role directly — skip step 2 below.
2. **Otherwise, read `ai_workspace/loop_state.md`.** Parse the second line to find the active role:
   ```
   **Current Role:** {RoleName} (Role NN) | History: ...
   ```
   The text after `Current Role:` and before `|` is your current role. If `(in-sendback)` suffix is present, you are in send-back mode — read `send_back.md` for details.
3. **If `loop_state.md` does not exist**, this is a fresh pipeline start. Begin at `01_interviewer.md`.
4. **Line 1 of `loop_state.md` holds the goal summary** as `**Goal Summary:** <text>`. All roles use this value for their git commit messages.
5. **Line 3 of `loop_state.md` is the pipeline config line**, carrying key-value pairs like `skip_docs={yes|no}` and `test_level={quick|deep|skip}`. Any role can update these values if the user changes their mind (with a summary note).

> **Note:** Lines 1–3 of `loop_state.md` end with `<br>` so they render on separate visual lines in markdown viewers. When parsing values from these lines, strip any trailing `<br>` before extracting data.
>
> **Why this order?** Line 1 carries the goal summary (read by every role for commit messages), line 2 tracks the active role and pipeline history (parsed at every session start), and line 3 holds mutable config (updated mid-pipeline as needed). Most frequently read values are placed first, with the most mutable config last.
6. **List** role skill files in `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **load** the skill file matching your current role from step 2 or 3.
7. **Read prior summary sections** from `loop_state.md` body (below line 3) to load cross-role context. Each section is headed by `## {Rolename} (Role NN) — Complete` or `— Send-Back Summary`.
8. **Check for `{NN}_rolename_in_progress.md`** in `ai_workspace/`. If it exists, read it — this is your role's resume file from a previous session. See `ai_workspace/skill_helpers/in_progress_guide.md` for full details on in-progress file usage and resume behavior.
9. **Check for `ai_workspace/project_overview.md`.** If it exists, read it — it describes what has been built across previous pipeline loops.
10. **Read** the current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
11. **Proactively greet the user.** Announce your role by name and number, then ask relevant questions to kick things off naturally.

### In-Progress Files
See `ai_workspace/skill_helpers/in_progress_guide.md` for full details on in-progress file usage, naming, and lifecycle.

---

## During a Role Session

- Fully adopt the persona and instructions in the loaded role skill file.
- Work through tasks with the user naturally — ask questions, iterate, refine.
- **Stay in your lane.** Do only what your current role's skill file asks you to do. If your role is planning, designing, or reviewing — produce plans, designs, or feedback. Do **not** write implementation code, create project files, or perform tasks that belong to a future role (especially the Worker). Future roles exist for a reason; trust them.
- **Artifacts** (code, reports, generated files) go in the **project root**, not inside `ai_workspace/`.
- If you find, or the user prompts for something, that is out of your current loop's scope, capture it by making a todo file inside the `ai_workspace/TODO` folder. After capturing this out-of-scope request as a todo file (see `ai_workspace/skill_helpers/todo_guide.md`), acknowledge it briefly then immediately resume your current role's work where you left off.
- Capturing a TODO does not count as completing your role's tasks — do not transition early or stop working because you logged something.

### User-Facing Prompt Conventions
When presenting a binary-choice prompt to the user, always list options as **"Option A (recommended) or Option B?"** so that "yes" = recommended/default choice and "no" = alternative. This applies to skip-docs prompts, send-back vs defer todo decisions, and any future binary choices across all roles. If both options are equally valid, pick one as default and state it clearly — never leave "yes" undefined.

---

## Pipeline Configuration (Line 3 of `loop_state.md`)

Line 3 is the **global mutable pipeline config line**. All parsing logic for this section lives here — role skill files and helper guides reference this section instead of duplicating it.

### Format
```
skip_docs={yes|no} | test_level={quick|deep|skip}<br>
```
- Key-value pairs separated by ` | ` (space-pipe-space).
- Line ends with `<br>` for markdown rendering. **Strip trailing `<br>` before parsing.**

### Parsing Rules
1. Read line 3 of `loop_state.md`.
2. Strip any trailing `<br>`.
3. Split on ` | ` to get individual key=value tokens.
4. Extract the value after `=` for the key you need (e.g., `skip_docs`, `test_level`).

### Guardrail — Unrecognized Values
If a parsed value does not match its expected options:
- `skip_docs` must be `yes` or `no`
- `test_level` must be `quick`, `deep`, or `skip`

**If unrecognized, ask the user directly for clarification.** Do not guess or assume. Record their answer on line 3 and note it in your summary section.

### Mutability Rules
Any role can update line 3 if the user changes their mind mid-pipeline. The updating role **must**:
1. Update the relevant key-value pair on line 3.
2. Note the change in its `loop_state.md` summary section (e.g., "User changed skip_docs from yes to no mid-session").

### Routing Matrix — Worker Handoff Targets
| skip_docs | test_level | Worker hands off to |
|-----------|------------|---------------------|
| no        | deep       | Tester → Documenter (existing flow) |
| no        | quick      | Tester → Documenter (Tester adjusts scope) |
| no        | skip       | Documenter          |
| yes       | deep       | Tester → Reviewer   |
| yes       | quick      | Tester → Reviewer   |
| yes       | skip       | Reviewer            |

### Routing Matrix — Tester Handoff Targets
| skip_docs | test_level | Tester hands off to |
|-----------|------------|---------------------|
| no        | deep/quick | Documenter (Role 05) |
| yes       | deep/quick | Reviewer (Role 06) — advance past Documenter |

---

## Transitioning Between Roles

When confident that you are ready to transition to the next role, automatically read and follow `ai_workspace/skill_helpers/transition_guide.md`.

---
