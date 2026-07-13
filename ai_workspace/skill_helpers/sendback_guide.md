# Send-Back Guide

Master instruction file for all send-back behavior. Every role should follow these rules when in send-back mode. Role-specific skill files may reference this guide instead of duplicating its content.

---

## Pipeline and Send-Back Routes

```
  ┌─────────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌─────────────┐     ┌───────────┐     ┌───────────┐
  │      01     │     │    02     │     │    03     │     │    04     │     │      05     │     │    06     │     │    07     │
  │ Interviewer │────>│  Planner  │────>│  Worker   │────>│  Tester   │────>│ Documenter  │────>│ Reviewer  │────>│ Finalizer │
  └─────────────┘     └─────┬─────┘     └───────────┘     └─────┬─────┘     └─────────────┘     └─────┬─────┘     └───────────┘
                            ▲                                   │                                     │
                            │     ┌─────────────────────────────┴─────────────────────────────────────┘
                            │     │
                   ┌────────┴─────▼────┐
                   │   Send-back to    │
                   │   Planner (02)    │
                   └───────────────────┘
```

**Send-back routing summary:**
- **Tester → Planner:** Test failures route back to the Planner for re-planning.
- **Reviewer → Planner:** Critical review findings route back to the Planner for re-planning.

---

## Initiating a Send-Back

Only certain roles can initiate send-backs. When doing so, follow these steps:

### Role-Specific Initiation Details

#### Tester (Role 04) — Send-Back on Bugs
When tests reveal bugs:
1. Present findings to the user — list each bug with file references, descriptions, and severity.
2. Ask how to proceed (send back or defer as a new TODO file).
3. Follow the Common Steps below.

#### Reviewer (Role 06) — Send-Back on Critical Issues
When you find **Critical** issues:
1. Present findings — list each issue with file references, descriptions, and recommended fixes.
2. Ask how to proceed (send back or defer as a new TODO file).
3. Follow the Common Steps below.

### Common Steps (All Sending Roles)

1. **Ask how to proceed (send back or defer as a new TODO file):**
   - **(a) Send back** — create `send_back.md` as described below.
   - **(b) Defer as new TODO file** — capture items per [`skill_helpers/todo_guide.md`](./todo_guide.md). Continue without interruption.
2. If the user chooses send-back:
   - Create (or append to) `ai_workspace/send_back.md` with:
     - `Source:` line identifying your role (e.g., `Source: Tester (Role 04)`).
     - `Current Role:` line pointing to **Planner (Role 02)**.
     - The list of items to fix.
   - If `send_back.md` already exists, **append** new entries — do NOT overwrite or delete existing content.
   - Do NOT overwrite or delete any `_complete.md` files.
3. **Commit:** Read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md` and use it as the commit body, with `[ai-{role-name}-sendback]` appended at end.

---

## Receiving a Send-Back (Roles Working on Sent-Back Items)

When `send_back.md` exists and points to your role, you are in send-back mode. Follow these rules:

### General Principles
- Address each newly listed item from `send_back.md`. Do not redo all your work from scratch — focus only on the sent-back items.
- After completing the fixes/updates and work is complete, update `Current Role:` in `send_back.md` to point to the next role (see routing table below).

> **⚠ Guardrails Still Apply**
>
> Send-back mode changes *what* you work on (sent-back items instead of original scope), but it does **not** change *how* you work. Each role's "What You Must Not Do" rules remain fully in effect. The Planner still only produces plans — never edits project files, even to fix the bugs that triggered the send-back. The Worker still doesn't write tests or docs. Trust the pipeline.

### Per-Role Send-Back Behavior (Reminder)

#### Planner (Role 02)
Append **planned** steps describing how each send-back item should be fixed. Do **not** perform the fixes yourself — describe them for the Worker to execute. Do **not** re-plan from scratch; only add the new steps needed. Once planning is complete: update `Current Role:` in `send_back.md` to `Worker (Role 03)`.

#### Worker (Role 03)
Fix each listed item. After completing fixes: update `Current Role:` in `send_back.md` to `Tester (Role 04)`.

## Completing a Role in Send-Back Mode

When transitioning out of send-back mode, follow the rules from [`transition_guide.md`](./transition_guide.md). Key differences from normal transitions:

### Summary File Handling
- **You are NOT the original sending role:** Append your send-back summary to the existing `{NN}_rolename_complete.md` — add a `---` divider followed by `## Send-Back Summary`, then your work recap. Do not overwrite the file. Then update `Current Role:` in `send_back.md` to point to the next role.
- **You ARE the original sending role and your re-check passes:** Append your send-back summary to the existing `{NN}_rolename_complete.md` as above, then **delete** `send_back.md` — the send-back cycle is complete.

### Git Commit Tagging
When in send-back mode (`send_back.md` exists now, or you just deleted it as the original sending role), use `[ai-{role-name}-sendback]` as the commit tag instead of `[ai-{role-name}]`. Extract `{role-name}` from the `_complete.md` filename (e.g., `03_worker_complete.md` → `worker`).

### Full Transition Steps
See [`transition_guide.md`](./transition_guide.md) for complete git steps, including:
- Reading `## Goal Summary` from `01_interviewer_complete.md` for the commit body.
- Staging and committing with the correct tag.
- Blocking transition on commit failure.

---
