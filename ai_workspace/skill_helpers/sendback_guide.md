# Send-Back Guide

Master instruction file for all send-back behavior. Every role follows these rules when in send-back mode. Role-specific skill files reference this guide instead of duplicating its content.

---

## Pipeline and Send-Back Routes

```
  Interviewer(01) → Planner(02) → Worker(03) → Tester(04) → Documenter(05) → Reviewer(06) → Finalizer(07)
                        ↑                                                  │                    │
                        └──────────── Send-back from Tester or Reviewer ────┴────────────────────┘
```

**Send-back routing:** Both Tester and Reviewer route issues back to Planner for re-planning.

---

## Send-Back Detection

Detected via `(in-sendback)` suffix on the active role in `loop_state.md` line 2:
```
Current Role: Planner (Role 02) (in-sendback) | History: Interviewer → Planner → Worker → Tester<br>
```

`send_back.md` is created for detailed issue descriptions, but **detection** comes from the `(in-sendback)` suffix.

---

## Initiating a Send-Back

Only Tester and Reviewer can initiate send-backs.

### Role-Specific Initiation

#### Tester (Role 04) — Bugs
Present findings to user: list each bug with file references, descriptions, severity. Ask how to proceed (send back or defer as TODO). Then follow Common Steps below.

#### Reviewer (Role 06) — Critical Issues
Present findings: list each issue with file references, descriptions, recommended fixes. Ask how to proceed (send back or defer as TODO). Then follow Common Steps below.

### Common Steps (All Sending Roles)

1. **Ask how to proceed** — evaluate context and mark the most appropriate option as "(recommended)":
   - **(a) Send back** — create `send_back.md`, update `loop_state.md` (below).
   - **(b) Defer as TODO file** — capture per [`todo_guide.md`](./todo_guide.md). Continue without interruption.

2. If user chooses send-back:
   - Create (or append to) `ai_workspace/send_back.md` with `Source:` line identifying your role and the list of items to fix. **Append** if file already exists — never overwrite.
   - **Update handoff line in `loop_state.md`:** set active role to `Planner (Role 02) (in-sendback)`, add your current role to history trail. Example (Tester):
     ```
     Before:  Current Role: Tester (Role 04) | History: Interviewer → Planner → Worker<br>
     After:   Current Role: Planner (Role 02) (in-sendback) | History: Interviewer → Planner → Worker → Tester<br>
     ```

3. **Commit:** Read `**Goal Summary:**` from line 1 of `loop_state.md`, use as commit body with `[ai-{role-name}-sendback]` appended.

---

## Receiving a Send-Back (Roles Working on Sent-Back Items)

When `(in-sendback)` points to your role in `loop_state.md` line 2, you are in send-back mode. Read `send_back.md` for issues to fix.

### General Principles
- Address each newly listed item from `send_back.md`. Do not redo all work from scratch — focus on sent-back items only.
- After fixes complete, update handoff line in `loop_state.md` to next role (see routing above). Keep `(in-sendback)` suffix if cycle continues.

> **⚠ Guardrails Still Apply**
> Send-back changes *what* you work on, not *how*. Each role's "What You Must Not Do" rules remain fully in effect. Planner still only produces plans — never edits project files. Worker still doesn't write tests or docs. Trust the pipeline.

### Per-Role Behavior

#### Planner (Role 02)
Append **planned** steps describing how each send-back item should be fixed. Do not perform fixes yourself — describe them for Worker. Do not re-plan from scratch; only add new steps needed. When done: update handoff to `Worker (Role 03) (in-sendback)`.

#### Worker (Role 03)
Fix each listed item. After completing fixes: update handoff to `Tester (Role 04) (in-sendback)`.

---

## Completing a Role in Send-Back Mode

Follow [`transition_guide.md`](./transition_guide.md) for full transition steps. Key send-back differences:

### Summary Section
Append under `## {Rolename} (Role NN) — Send-Back Summary` header instead of `— Complete`.

- **Not the original sending role:** Append summary, update handoff to next role with `(in-sendback)` suffix.
- **Original sending role and re-check passes:** Append summary, remove `(in-sendback)` suffix from handoff line. **Delete `send_back.md`** — cycle complete.

### Git Commit Tagging
Use `[ai-{role-name}-sendback]` tag instead of `[ai-{role-name}]`. Extract `{role-name}` from role name (e.g., Worker → `worker`). Applies when `(in-sendback)` is present, or you just removed it as the original sending role.

### Full Transition Steps
See [`transition_guide.md`](./transition_guide.md) for complete git steps: reading goal summary from line 1, staging/committing with correct tag, blocking transition on commit failure.
