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
2. Ask how to proceed (send back or defer as TODO).
3. Follow the Common Steps below.

#### Reviewer (Role 06) — Send-Back on Critical Issues
When you find **Critical** issues:
1. Present findings — list each issue with file references, descriptions, and recommended fixes.
2. Ask how to proceed (send back or defer as TODO).
3. Follow the Common Steps below.

### Common Steps (All Sending Roles)

1. **Ask how to proceed (send back or defer as TODO):**
   - **(a) Send back** — create `send_back.md` as described below.
   - **(b) Defer as TODO** — capture items per [`skill_helpers/todo_guide.md`](./todo_guide.md). Continue without interruption.
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

### Per-Role Send-Back Behavior

#### Planner (Role 02)
Append **planned** steps describing how each send-back item should be fixed. Do **not** perform the fixes yourself — describe them for the Worker to execute. Do **not** re-plan from scratch; only add the new steps needed. Once planning is complete: update `Current Role:` in `send_back.md` to `Worker (Role 03)`.

#### Worker (Role 03)
Fix each listed item. After completing fixes: update `Current Role:` in `send_back.md` to `Tester (Role 04)`.

#### Tester (Role 04) — Running Again During Send-Back Mode
1. **Run the complete test suite** — all original tests plus any new or modified send-back tests.
2. If all pass: append send-back summary to `04_tester_complete.md`, update `Current Role:` in `send_back.md` to `Documenter (Role 05)`.
3. If failures remain: update `send_back.md` with remaining bugs, set `Current Role: Planner (Role 02)` to re-initiate the send-back loop.

#### Documenter (Role 05)
Proceed with normal documentation tasks (incorporating any changes from the send-back cycle). After completing documentation: update `Current Role:` in `send_back.md` to `Reviewer (Role 06)`.

#### Reviewer (Role 06) — Running Again During Send-Back Mode
1. Re-run review against the fixed implementation.
2. If no critical issues remain: append send-back summary to `06_reviewer_complete.md`, **delete** `send_back.md` — the send-back cycle is complete.
3. If issues remain: update `send_back.md` with remaining issues, set `Current Role: Planner (Role 02)` to re-initiate the send-back loop.

### Send-Back Routing Table (Next Role After Completion)

| Current Role | Next Role After Completion |
|---|---|
| Planner (02) | Worker (03) |
| Worker (03) | Tester (04) |
| Tester (04) — all pass | Documenter (05) |
| Tester (04) — failures remain | Planner (02) |
| Documenter (05) | Reviewer (06) |
| Reviewer (06) — no critical issues | **Delete** `send_back.md` (cycle complete) |
| Reviewer (06) — issues remain | Planner (02) |

---

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

## Send-Back Log

When working in send-back mode, append a log entry under this heading in your role's `_complete.md` summary to track what was addressed during the send-back cycle. Tag it as `[ai-{role-name}-sendback]`.
