# Agent Workflow — Sequential Role Pipeline

AI assistant working through a **sequential pipeline of roles**. Each role is a skill file in `ai_workspace/roles/`. Adopt one role at a time, complete its work, transition to the next. Pipeline loops across project lifecycle — first run kicks off or analyzes; subsequent runs add features, refactor, or fix bugs.

---

## Session Startup — Determine Current Role

On every session start:

1. **Read `ai_workspace/loop_state.md`.** Parse line 2 for active role:
   ```
   **Current Role:** {RoleName} (Role NN) | History: ...
   ```
   Text after `Current Role:` and before `|` is your current role. If `(in-sendback)` suffix present, read [`sendback_guide.md`](ai_workspace/skill_helpers/sendback_guide.md) for master instructions — send-back issue details live inline in the relevant Tester/Reviewer summary section of `loop_state.md` under `### Send-Back Issues`.
2. **If `loop_state.md` does not exist**, fresh pipeline start — begin at `01_interviewer.md`.
3. **Line 1 of `loop_state.md`:** `**Goal Summary:** <text><br>` — all roles use this value for git commit messages.
4. **Line 3 is the pipeline config line** (see [Pipeline Configuration](#pipeline-configuration-line-3-of-loop_statemd) below). Any role can update values if user changes their mind (with summary note).

> Lines 1–3 end with `<br>` for markdown rendering. **Strip trailing `<br>` before parsing.** Line 1 = goal summary (most read), line 2 = active role + history, line 3 = mutable config.

5. **List** `ai_workspace/roles/` sorted by numeric prefix (`01_`, `02_`, etc.), then **load** the skill file matching your current role from step 1 or 2.
6. **Read prior summary sections** from `loop_state.md` body (below line 3). Sections headed by `## {Rolename} (Role NN) — Complete` or `— Send-Back Summary`.
7. **Check for `ai_workspace/project_overview.md`.** If exists, read it — describes what has been built across previous loops.
8. **Read** current role's skill file from `ai_workspace/roles/{NN}_rolename.md`.
9. **Proactively greet the user.** Announce role by name and number, ask relevant questions to kick things off naturally.
10. **Cancel awareness (Roles 01–06).** During your session, watch for the user saying "cancel" or equivalent. If detected, follow [`cancel_guide.md`](ai_workspace/skill_helpers/cancel_guide.md). Role 07 (Finalizer) ignores cancel requests.

> **Migration note:** Stale `_in_progress.md` or `send_back.md` files from before this consolidation may still exist on disk. Ignore them — their content has been absorbed into `loop_state.md`. They will be cleaned up at the next Finalizer run.

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
test_level={quick|deep|skip} | skip_docs={yes|no} | can_loop={true|false}<br>
```
Key-value pairs separated by ` | `. Line ends with `<br>` for rendering. **Strip trailing `<br>` before parsing.** Parse: read line 3, strip `<br>`, split on ` | `, extract value after `=` for needed key.

### Guardrail — Unrecognized Values
- `skip_docs` must be `yes` or `no`; `test_level` must be `quick`, `deep`, or `skip`; `can_loop` must be `true` or `false`.
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

## Mid-Loop Cancellation

Roles 01–06 support mid-loop cancellation. Role 07 (Finalizer) is excluded — it is already performing loop cleanup.

**Trigger:** User says "cancel" at any point during a role session. Do not execute immediately — follow the two-step confirmation flow in [`cancel_guide.md`](ai_workspace/skill_helpers/cancel_guide.md).

**Two options presented to user:**
- **(a) Cancel loop (keep TODO for later)** — Undo all work, restore original TODO item.
- **(b) Cancel entirely** — Undo all work, permanently archive/delete the TODO item.

Both paths perform a full git reset to pre-loop state and delete `loop_state.md`. See [`cancel_guide.md`](ai_workspace/skill_helpers/cancel_guide.md) for complete procedure including pre-loop state identification, failure handling, send-back mode behavior, and edge cases.

---

## Transitioning Between Roles

When ready to transition, automatically read and follow [`transition_guide.md`](ai_workspace/skill_helpers/transition_guide.md).

---
