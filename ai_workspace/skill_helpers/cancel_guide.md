# Cancel Guide

Master instruction file for mid-loop cancellation. Roles 01–06 follow these steps when the user requests cancellation of the current loop's work. Role-specific skill files reference this guide instead of duplicating its content.

---

## Who Can Cancel

- **Roles 01–06** (Interviewer through Reviewer) — all support mid-loop cancellation.
- **Role 07 (Finalizer)** — excluded. Finalizer is already performing loop cleanup; cancellation does not apply.

---

## Trigger Recognition

The user says **"cancel"** (or clearly equivalent phrasing like "abort this", "stop and cancel") at any point during a role session. This triggers the two-step confirmation flow below. Do **not** execute cancellation immediately — always confirm first.

---

## Two-Step Confirmation Flow

### Step 1 — Present Options

Ask the user which type of cancellation they want, marking one as "(recommended)" based on context:

- **(a) Cancel loop (keep TODO for later)** — Undo all work from this loop and restore the original TODO item so it can be picked up in a future loop. *(Recommended when the user wants to revisit the same goal later.)*
- **(b) Cancel entirely** — Undo all work from this loop and permanently archive/delete the TODO item. The goal is abandoned.

### Step 2 — Confirm Before Execution

Before performing any cleanup, restate what will happen:

> "Confirming: you want to **[cancel loop / cancel entirely]**. This will reset all changes back to pre-loop state via git reset and [restore / permanently delete] the TODO item. Type **yes** to proceed."

Only proceed if the user explicitly confirms with **"yes"** (or clear equivalent). If they say no or ask questions, answer them and re-prompt. Do not proceed on ambiguous responses.

---

## Pre-Loop State Identification

Find the git commit that represents the state before this loop started:

1. **Compute log depth** using dynamic git log depth (same as Reviewer/Finalizer):
   - Parse line 2 of `loop_state.md` for the history string after `History:`.
   - Count the number of role entries separated by `→`.
   - Compute `(count × 2) + 5` = your `-N` depth.
   - If parsing fails or file is missing, use `-15`.

2. **Run:** `git log --format="%H %s" -N <computed-depth>`

3. **Find the loop boundary:** Read line 1 of `loop_state.md` for the goal summary text (after `**Goal Summary:**`, strip trailing `<br>`). Scan the git log output from newest to oldest — find commits whose subject starts with that goal summary string. The **parent hash** of the **oldest matching commit** is your pre-loop state.

4. **If no matching commits found**, fall back to the first commit in the log that does *not* contain `[ai-pipeline]` or any `[ai-{role-name}]` tag from the current loop's roles. If still ambiguous, use `HEAD~<number-of-entries-in-history>` as a conservative estimate and warn the user before proceeding.

---

## Execution — Cancel Loop (Keep TODO)

1. **Identify pre-loop hash** per [Pre-Loop State Identification](#pre-loop-state-identification) above.
2. **Perform git reset:** `git reset --hard <pre-loop-hash>`
3. **Check TODO item:** If the loop started from a TODO file in `ai_workspace/TODO/`, verify it was restored by the reset:
   - If the TODO file existed as a committed file before the loop, the hard reset already restored it — no further action needed.
   - If the TODO file is **not** present after the reset (e.g. it was untracked or never committed), recover it manually from git history:
     - Search for the deleted TODO file: `git log --diff-filter=D --name-only --format="" -- "ai_workspace/TODO/"` to find which commit deleted it.
     - Recover the file: `git show <commit-before-deletion>:<path-to-todo-file> > ai_workspace/TODO/<filename>.md`.
   - If no TODO file was involved (fresh goal, not from a TODO), skip this step.
4. **Delete `loop_state.md`:** `rm ai_workspace/loop_state.md`
5. **Inform the user:** "Loop cancelled. All changes reverted to pre-loop state. TODO item restored — it will be available for a future loop."

---

## Execution — Cancel Entirely (Abandon Goal)

1. **Identify pre-loop hash** per [Pre-Loop State Identification](#pre-loop-state-identification) above.
2. **Perform git reset:** `git reset --hard <pre-loop-hash>`
3. **Archive/delete TODO item:** If the loop started from a TODO file, permanently remove it now that the working tree is at pre-loop state:
   - Move the restored TODO file to `ai_workspace/TODO/archive/` (create directory if needed), appending `_cancelled_{YYYY-MM-DD}.md` to the filename.
   - If no archive directory exists or creation fails, simply delete the file and note this in your message to the user.
   - If no TODO file was involved (fresh goal, not from a TODO), skip this step.
4. **Delete `loop_state.md`:** `rm ai_workspace/loop_state.md`
5. **Inform the user:** "Loop cancelled entirely. All changes reverted. TODO item [archived / deleted]. This goal is abandoned."

---

## Failure Handling

If any step fails mid-way (git reset error, file not found, permission denied):

1. **Stop immediately.** Do not attempt partial cleanup or continue with remaining steps.
2. **Warn the user** with a clear message describing what failed and what state the repo is currently in:
   > "Cancellation failed at step [X]: [error details]. The repository may be in an inconsistent state. Please review manually before proceeding."
3. **Do not delete `loop_state.md`** if cleanup was incomplete — it serves as a record of where things stood.

---

## Send-Back Mode Cancellation

When `(in-sendback)` suffix is present on line 2 of `loop_state.md`, cancellation works the same way — full git reset to pre-loop state. There is no squash commit yet (Finalizer hasn't run), so all intermediate commits including send-back iterations are undone by the reset. No special handling beyond the standard flow above.

---

## Edge Cases and Guards

- **Git not initialized:** If `git status` fails, inform the user: "This directory is not a git repository — automatic cancellation via git reset is not available. Please review changes manually."
- **Only one commit exists:** Warn the user before resetting to the initial commit or root state. Confirm explicitly that they understand this will undo all project history in the working tree.
- **`loop_state.md` missing:** If `loop_state.md` does not exist but user requests cancel, inform them there is no active loop to cancel.

---

## What Cancellation Does NOT Do

- Does **not** affect completed pipeline loops (those squashed by Finalizer into `[ai-pipeline]` commits).
- Does **not** modify `project_overview.md` — that file persists across loops and is managed by the Finalizer.
- Does **not** require a git commit — cancellation resets rather than records changes.
