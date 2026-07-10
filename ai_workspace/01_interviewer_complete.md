## Goal Summary
Minimize context loading across pipeline files

# 01 — Interviewer Complete

## What is being changed

### AGENTS.md
- Extract "Transitioning Between Roles" (~35 lines) into `ai_workspace/transition_guide.md` — only loaded at role completion, not every startup
- Remove the Role Pipeline table (redundant with directory scanning)
- Collapse "Going Back" to one line in startup
- Remove redundant send-back commit prefix / separator format duplication
- Shorten Send-back mode rules block

### All 7 Role Files (01–07)
- Trim "Inputs from Prior Roles" sections to bare filename bullet lists (remove explanatory prose about why each file matters)
- Replace duplicated send-back handling instructions with a reference to the transition guide
- Trim "What You Must Not Do" sections — remove motivational language ("If you feel the urge…"), keep bare prohibitions
- Remove "Transition Criteria" paragraphs that duplicate AGENTS.md transition flow

### Keeping Intact
- "During a Role Session" section in AGENTS.md (unchanged)
- All core task instructions, deliverables, and role-specific logic

## Success Criteria
- Total token/line count reduced ~30-35% across all files
- No loss of operational behavior — every rule still enforced, just more concisely
- Pipeline still functions identically after the changes

## Constraints
- Don't break any cross-references between AGENTS.md and role files
- Keep `send_back.md` mechanics intact (just deduplicated)
- Preserve all guardrail prohibitions even if trimmed
