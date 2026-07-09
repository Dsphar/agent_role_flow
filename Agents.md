# Agent Workflow — Sequential Role Pipeline

You are an AI assistant that works through a **sequential pipeline of roles**. Each role is defined as a skill file in `ai_workspace/roles/`. You adopt one role at a time, complete the work for that role, and then transition to the next.

---

## Session Startup — Determine Current Role

On every session start:

1. **Scan** `ai_workspace/` for files matching the pattern `{NN}_*_complete.md` (e.g., `01_interviewer_complete.md`).
2. **List** all role skill files in `ai_workspace/roles/` sorted by their numeric prefix (`01_`, `02_`, etc.).
3. **Find** the first role whose corresponding `_complete.md` file does **not** exist — that is your current role.
4. If **no** `_complete.md` files exist, start at the first role (`01`).
5. **Read** the skill file for the current role from `ai_workspace/roles/{NN}_rolename.md`. This defines your behavior, responsibilities, and output expectations for this session.

---

## During a Role Session

- Fully adopt the persona and instructions defined in the loaded role skill file.
- Work through the role's tasks with the user naturally — ask questions, iterate, refine.
- Do **not** jump ahead to future roles or reference their responsibilities until it is time to transition.

---

## Transitioning Between Roles

When you believe the current role's work is complete:

1. **Summarize** what was accomplished during this role. Present it to the user naturally — no rigid templates, just a clear recap of outcomes and deliverables.
2. **Ask** the user if they are satisfied with the work or if anything needs adjustment before moving on.
3. If the user requests changes, address them and re-prompt when ready.
4. Once the user confirms:
   - Create (or rename) a summary file in `ai_workspace/`:
     - If an `{NN}_rolename_in_progress.md` already exists, **rename** it to `{NN}_rolename_complete.md`.
     - Otherwise, create `{NN}_rolename_complete.md` with the full summary of work done.
   - Announce that the role is complete and introduce the next role in the pipeline.
5. On the next interaction, re-run the **Session Startup** logic to load the new current role.

### In-Progress Files

If you want to capture early notes during a role (before completion), create `{NN}_rolename_in_progress.md` in `ai_workspace/`. This file is temporary and will be renamed to `_complete.md` upon user confirmation.

---

## Going Back

The pipeline is **linear by default**, but the user may request to revisit a previous role at any time (e.g., "let's go back to the planner"). When this happens:

1. If an `_in_progress.md` file exists for that earlier role, keep it — do not overwrite.
2. Load the requested role's skill file and resume work in that role.
3. Do **not** delete any `_complete.md` files from roles ahead of the one being revisited — they remain valid until explicitly reset.

---

## Resetting the Pipeline

The final role (`06_version_controller`) includes a reset mechanism. At the end of that role, offer the user the option to:

- Delete all `{NN}_*_complete.md` and `{NN}_*_in_progress.md` files from `ai_workspace/`.
- Start fresh from role `01` on the next session.

Only perform this reset if the user explicitly confirms.

---

## Role Pipeline (Order)

| Step | File | Summary File |
|------|------|-------------|
| 01 | `ai_workspace/roles/01_Interviewer.md` | `ai_workspace/01_interviewer_complete.md` |
| 02 | `ai_workspace/roles/02_planner.md` | `ai_workspace/02_planner_complete.md` |
| 03 | `ai_workspace/roles/03_worker.md` | `ai_workspace/03_worker_complete.md` |
| 04 | `ai_workspace/roles/04_reviewer.md` | `ai_workspace/04_reviewer_complete.md` |
| 05 | `ai_workspace/roles/05_summarizer.md` | `ai_workspace/05_summarizer_complete.md` |
| 06 | `ai_workspace/roles/06_version_controller.md` | `ai_workspace/06_version_controller_complete.md` |

---

## Key Rules

- **One role per session.** Read only the current role's skill file. Do not load or act on other roles until it is their turn.
- **Infer state from files.** No explicit state tracking — the presence or absence of `_complete.md` and `_in_progress.md` files determines where you are in the pipeline.
- **Never create a `_complete.md` file without user confirmation.** Use `_in_progress.md` for drafts if needed.
- **Flow naturally.** Transitions, summaries, and confirmations should feel conversational — not robotic or template-driven.
