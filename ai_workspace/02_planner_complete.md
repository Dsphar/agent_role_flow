# 02 — Planner Complete

## Goal Summary
Fix transition_guide scope deviation, send-back routing, and commit conventions

## Architecture Overview
Three targeted text edits across `transition_guide.md` and individual role skill files. No new files or structural changes — minimal diff throughout. All changes are prose/formatting only.

## File/Module Map
| File | Action |
|------|--------|
| `ai_workspace/roles/transition_guide.md` | Modify (2 edits: scope deviation + send-back routing) |
| `ai_workspace/roles/01_Interviewer.md` | Modify (add commit convention note) |
| `ai_workspace/roles/03_worker.md` | Modify (add commit convention note) |
| `ai_workspace/roles/04_tester.md` | Modify (add commit convention note) |
| `ai_workspace/roles/05_documenter.md` | Modify (add commit convention note) |
| `ai_workspace/roles/06_reviewer.md` | Modify (add commit convention note) |
| `ai_workspace/todo.md` | Modify (remove 3 completed items) |

## Ordered Implementation Steps

### Step 1 — Revert Scope Deviation in transition_guide.md
- Open `ai_workspace/roles/transition_guide.md`.
- On line ~21, change `"I skip this step silently"` back to `"skip this step silently"` (second-person).
- This was an unintended first-person change from the imperative-shell-command rewrite loop. Only shell command lines should be first-person; general prose stays second-person.

### Step 2 — Fix Send-Back Routing in transition_guide.md
Two sub-edits in `ai_workspace/roles/transition_guide.md`:

**2a. ASCII diagram:** Remove Worker (03) as a send-back target for both Tester and Reviewer.
- The Tester's send-back box currently lists `- Planner (02)` and `- Worker (03)`. Remove the Worker line so it reads only `- Planner (02)`.
- The Reviewer's send-back box currently lists `- Planner (02)` and `- Worker (03)`. Remove the Worker line so it reads only `- Planner (02)`.
- Adjust arrow routing: both Tester and Reviewer arrows should point to Planner (02) only.

**2b. Text summary:** Update prose below the diagram.
- Change `"Tester → Planner / Worker"` to `"Tester → Planner"`.
- Change `"Reviewer → Any prior role"` to `"Reviewer → Planner"`.

### Step 3 — Enforce Commit Message Convention Across Role Files
Add a commit body directive to each role file that mentions committing but doesn't yet reference the shared Goal Summary. The convention: read `## Goal Summary` from `01_interviewer_complete.md` and use it as the commit message body, with `[ai-{role-name}]` or `[ai-{role-name}-sendback]` appended at end.

**3a. `01_Interviewer.md`** — Already defines the convention in Deliverables. No change needed (it's the source of truth).

**3b. `03_worker.md`** — Add a note under "What You Must Not Do" or as a new small section: when performing the mandatory per-role transition commit, read `## Goal Summary` from `ai_workspace/01_interviewer_complete.md` for the commit body. See `transition_guide.md` git steps for details.

**3c. `04_tester.md`** — The send-back option mentions `"Commit with [ai-tester-sendback]"`. Add instruction to use `## Goal Summary` from `01_interviewer_complete.md` as the commit body, with `[ai-tester-sendback]` appended at end.

**3d. `05_documenter.md`** — Mentions "mandatory per-role transition commit" but no convention. Add a brief note directing to use `## Goal Summary` from `01_interviewer_complete.md` as the commit body, with `[ai-documenter]` appended at end.

**3e. `06_reviewer.md`** — The send-back option mentions `"Commit with [ai-reviewer-sendback]"`. Add instruction to use `## Goal Summary` from `01_interviewer_complete.md` as the commit body, with `[ai-reviewer-sendback]` appended at end.

**3f. `07_finalizer.md`** — Already reads `## Goal Summary` in step 1 of "Loop Reset and Handoff". No change needed.

### Step 4 — Remove Completed TODO Items
- Open `ai_workspace/todo.md`.
- Remove the three items addressed by this loop:
  - "Fix Scope Deviation in transition_guide.md"
  - "Fix Pipeline Diagram in transition_guide.md"
  - "Fix Sendback Commit Messages to Use Shared Summary from interviewer_complete"
- Leave W1 and W2 intact (out of scope for this loop).

## Risks and Open Questions
- **Diagram ASCII alignment:** Removing the Worker send-back lines may affect box width/arrow routing in the ASCII art. The Worker should preserve visual alignment — boxes may need re-sizing or arrows re-routed cleanly.
- **No open questions** — all three fixes are well-scoped from the Interviewer summary.
