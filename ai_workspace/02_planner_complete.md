## Goal Summary
Minimize context loading across pipeline files

# 02 — Planner Complete

## Architecture Overview
- Create `ai_workspace/transition_guide.md` — new file holding the extracted transition flow and deduplicated send-back rules
- Modify 8 files: `AGENTS.md` + all 7 role files
- Add a note in AGENTS.md telling the agent to load `transition_guide.md` when transitioning

## Ordered Implementation Steps

1. **Create `transition_guide.md`** — move the full "Transitioning Between Roles" section from AGENTS.md into this new file, plus any send-back commit/log rules that are currently duplicated across role files
2. **Trim AGENTS.md** — remove transition section (replace with reference to transition_guide.md), remove Role Pipeline table, collapse "Going Back" to one line, shorten send-back mode rules block
3. **Trim all 7 role files** — for each: reduce Inputs sections to bare filenames, replace send-back duplication with a reference to the transition guide, trim guardrail prose, remove Transition Criteria paragraphs
4. **Verify cross-references** — ensure no broken references between AGENTS.md, transition_guide.md, and role files

## Risks / Open Questions
- Removing motivational language from guardrails is a judgment call on how much to cut — keep prohibitions explicit but remove the "if you feel the urge" framing

---

## Send-Back Summary (from Reviewer)

Addressed two send-back items from the Reviewer:

- **S1:** Added a filename casing note in `transition_guide.md` clarifying that summary filenames (`*_complete.md`, `*_in_progress.md`) always use lowercase role names.
- **S2:** Added an ASCII pipeline diagram and send-back routing summary to `transition_guide.md` showing the full 7-role flow and all send-back routes (Tester→Planner/Worker, Reviewer→any prior role).
