# Project Context

## What This Is
A sequential agent role pipeline for building software projects. Seven roles run in order: Interviewer → Planner → Worker → Tester → Summarizer → Reviewer → Finalizer. Each role is defined by a skill file in `ai_workspace/roles/`.

## File Structure
```
AGENTS.md                          — Pipeline workflow instructions (read every session start)
ai_workspace/
  roles/                           — Role skill files (01_Interviewer.md through 07_finalizer.md)
  project_context.md               — This file
  todo.md                          — Out-of-scope requests from prior sessions
  transition_guide.md              — Transition flow + send-back rules (loaded at role completion only)
  *_complete.md                    — Per-role session summaries (deleted on Finalizer reset)
```

## Key Design Decisions
- **Role isolation:** Each role has "What You Must Not Do" guardrails to prevent bleeding into other roles.
- **State via files:** Pipeline state inferred from `_complete.md` / `_in_progress.md` — no external tracking.
- **AGENTS.md minimal (~50 lines):** Transition flow, send-back rules, and guardrail prose extracted to `transition_guide.md` (loaded only at role completion). Role skill files trimmed similarly. Operational logic only.
- **Summarizer before Reviewer:** Docs produced before the quality gate so they get reviewed too.
- **User-prompted send-back:** Tester/Reviewer present findings and ask whether to create `send_back.md` (routes to Planner) or defer as TODO. Human decides — no auto-send.
- **Per-role git commits:** Every role transitions with `[ai-{role-name}] -- <goal summary>`. Send-back cycles use `-sendback` suffix. Transition blocks on commit failure. Goal body sourced from `## Goal Summary` in `01_interviewer_complete.md`.
- **Send-back persistence:** `send_back.md` persists through the full re-run cycle with a `Current Role:` pointer and per-role log entries under "## Send-Back Log". Only the original sending role deletes it.
- **Finalizer always resets:** Single `[ai-finalizer]` commit, no "wrap up" option. Pipeline loops continuously.

## Recent Changes
- **Loop N+5 — Context loading trim (2026-07-09):** Reduced `AGENTS.md` and all 7 role files by ~98 lines total (~30-35%). Extracted transition flow to `transition_guide.md`. Trimmed prose in Inputs, Tasks, guardrails, and Transition Criteria sections. All operational behavior preserved — verified by Tester with zero bugs found.

## Known Issues
- **W1:** Ambiguity if both Tester and Reviewer append `Current Role:` lines to `send_back.md` simultaneously. Unlikely in practice.
- Guardrail enforcement is imperfect — roles can break boundaries when directly prompted by the user.

> Loop/iteration history preserved in git via per-role commits (`[ai-{role-name}]`) and Finalizer reset commits (`[ai-finalizer]`). This file tracks current state only.

## How to Use
1. Start a session — agent reads AGENTS.md, auto-detects current role from `_complete.md` files.
2. Work through roles sequentially, confirming completion at each step.
3. At Role 07 (Finalizer), the pipeline resets for the next iteration.
