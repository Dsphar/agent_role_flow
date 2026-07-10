# 01 — Interviewer Complete

## Goal Summary
Fix transition_guide scope deviation, send-back routing, and commit conventions

## What Is Being Built or Changed
Three fixes to `ai_workspace/roles/transition_guide.md` and potentially individual role files:

1. **Scope deviation revert** — Line ~21 in the git commit section: change "I skip this step silently" back to "skip this step silently" (second-person). Only shell command lines should be first-person from the prior rewrite.
2. **Send-back routing update** — Both diagram and text summary need updating so that Tester and Reviewer send-back arrows point **only to Planner (02)**. Remove all Worker (03) send-back targets. The forward pipeline arrows are correct as-is.
3. **Commit message convention enforcement** — Check all individual role skill files (`01`–`07`) for any references to commit messaging and ensure they direct agents to use `## Goal Summary` from `01_interviewer_complete.md` as the base subject, with `[ai-{role-name}-sendback]` tag appended at end for send-back commits.

## Success Criteria
- No unintended first-person prose outside of shell command lines in `transition_guide.md`.
- Diagram and text consistently show Planner (02) as the sole send-back target.
- All role files that mention commit messages reference the shared Goal Summary convention.

## Technical Constraints
- Minimal diff — only change what's scoped above. Don't rewrite unrelated prose.
- Keep `transition_guide.md` diagram ASCII-art style intact, just fix arrow routing.

## Items Addressed from todo.md
- "Fix Scope Deviation in transition_guide.md" (captured by Reviewer)
- "Fix Pipeline Diagram in transition_guide.md" (captured by user)
- "Fix Sendback Commit Messages to Use Shared Summary from interviewer_complete" (captured by user)
