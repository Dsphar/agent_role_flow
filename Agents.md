# Agent Workflow — Sequential Role Pipeline

AI assistant working through a **sequential pipeline of roles**. Each role is a skill file in `ai_workspace/roles/`. Adopt one role at a time, complete its work, transition to the next. Pipeline loops across project lifecycle — first run kicks off or analyzes; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

1. **Check `ai_workspace/send_back.md`.** If it exists, you may be in send-back mode — read it for context. Confirm via `(in-sendback)` suffix on active role in `loop_state.md` line 2. If confirmed, read [`sendback_guide.md`](ai_workspace/skill_helpers/sendback_guide.md) for master instructions.
2. **If `send_back.md` exists AND `(in-sendback)` is present:** Extract current role from handoff line (active role with `(in-sendback)` suffix). Load that role directly — skip step 3.
3. **Otherwise, read `ai_workspace/loop_state.md`.** Parse line 2 for active role:
   ```
   **Current Role:** {RoleName} (Role NN) | History: ...
   ```
   Text after `Current Role:` and before `|` is your current role. If `(in-sendback)` suffix present, read `send_back.md` for details.
4. **If `loop_state.md` does not exist**, fresh pipeline start — begin at `01_interviewer.md`.
5. **Line 1 of `loop_state.md`:** `**Goal Summary:** <text><br>` — all roles use this value for git commit messages.
6. **Line 3 is the pipeline config line** (see [Pipeline Configuration](#pipeline-configuration-line-3-of-loop_statemd) below). Any role can update values if user changes their mind (with summary note).

> Lines 1–3 end with `<br>` for markdown rendering. **Strip trailing `<br>` before parsing.** Line 1 = goal summary (most read), line 2 = active role + history, line 3 = mutable config.

7. **List** `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **load** the skill file matching your current role from step 3 or 4.
8. **Read prior summary sections** from `loop_state.md` body (below line 3). Sections headed by `## {Rolename} (Role NN) — Complete` or `— Send-Back Summary`.
9. **Check for `{NN}_rolename_in_progress.md`** in `ai_workspace/`. If exists, read it — your role's resume file from previous session. See [In-Progress File Lifecycle](ai_workspace/skill_helpers/transition_guide.md#in-progress-file-lifecycle) in `transition_guide.md` for full details.
10. **Check for `ai_workspace/project_overview.md`.** If exists, read it — describes what has been built across previous loops.
11. **Read** current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
12. **Proactively greet the user.** Announce role by name and number, ask relevant questions to kick things off naturally.

---

## During a Role Session

- Fully adopt persona and instructions in loaded role skill file.
- Work through tasks with user naturally — ask questions, iterate, refine.
- **Stay in your lane.** Do only what your current role's skill file asks. If planning/designing/reviewing — produce plans/designs/feedback. Do **not** write implementation code, create project files, or perform future roles' tasks (especially Worker). Future roles exist for a reason; trust them.
- **Artifacts** (code, reports, generated files) go in the **project root**, not inside `ai_workspace/`.
- Out-of-scope requests: capture as todo file in `ai_workspace/TODO/` per [`todo_guide.md`](ai_workspace/skill_helpers/todo_guide.md). Acknowledge briefly, then immediately resume current work. Capturing a TODO does not count as completing your tasks — do not transition early.

### User-Facing Prompt Conventions

Binary-choice prompts: always list as **"Option A (recommended) or Option B?"** so "yes" = recommended/default, "no" = alternative. Applies to skip-docs, send-back vs defer, and any future binary choices across all roles. If both options equally valid, pick one as default and state it clearly — never leave "yes" undefined.

---

## Pipeline Configuration (Line 3 of `loop_state.md`)

Line 3 is the **global mutable pipeline config line**. All parsing logic lives here — role files and helpers reference this section instead of duplicating it.

### Format
```
skip_docs={yes|no} | test_level={quick|deep|skip}<br>
```
Key-value pairs separated by ` | `. Line ends with `<br>` for rendering. **Strip trailing `<br>` before parsing.** Parse: read line 3, strip `<br>`, split on ` | `, extract value after `=` for needed key.

### Guardrail — Unrecognized Values
- `skip_docs` must be `yes` or `no`; `test_level` must be `quick`, `deep`, or `skip`.
- **If unrecognized, ask user directly.** Do not guess. Record answer on line 3 and note in summary section.

### Mutability Rules
Any role can update line 3 if user changes their mind mid-pipeline. Updating role **must**: (1) update relevant key-value pair on line 3; (2) note change in its `loop_state.md` summary section.

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

### Dynamic Git Log Depth (Reviewer & Finalizer)

Compute bounded `-N` for `git log --format="%H %s" -N <depth>`: parse line 2 of `loop_state.md` for history string after `History:`, compute `(count × 2) + 5` = your `-N`. If parsing fails or file missing, use `-15`. Run `git log --format="%H %s" -N <computed-depth>`. Find commits whose subject starts with goal summary (line 1). Parent hash of oldest match = pre-loop state.

---

## Shared Cross-Role Constraints

Constraints shared across multiple roles. Role skill files reference this section instead of duplicating these entries.

| Constraint | Applies To |
|------------|------------|
| Do not write tests | Worker, Tester (Tester's own lane) |
| Do not fix bugs in implementation code — document for send-back/TODO instead | Tester |
| Do not perform code reviews or architectural quality reviews | Worker, Tester |
| Do not write project documentation (READMEs, API docs, usage guides) | Worker, Tester |
| Do not handle version control beyond mandatory per-role transition commit | Worker, Documenter |

---

## Transitioning Between Roles

When ready to transition, automatically read and follow [`transition_guide.md`](ai_workspace/skill_helpers/transition_guide.md).

---
