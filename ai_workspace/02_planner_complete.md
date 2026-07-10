## Goal Summary
Rename Summarizer role to Documenter across all files

## Architecture Overview
Purely cosmetic rename — no structural or behavioral changes. Replace "Summarizer"/"summarizer" with "Documenter"/"documenter" across 7 workspace files, plus rename the skill file itself.

## File/Module Map
| File | Action |
|------|--------|
| `roles/05_summarizer.md` → `05_documenter.md` | Rename file; update title, send-back ref, output filename |
| `project_context.md` | 2 replacements in role list + design decision |
| `roles/03_worker.md` | 1 guardrail replacement |
| `roles/04_tester.md` | 2 replacements (send-back route + guardrail) |
| `roles/06_reviewer.md` | 3 replacements (input filename + 2 mentions) |
| `roles/07_finalizer.md` | 1 checklist replacement |
| `transition_guide.md` | Pipeline diagram + text example |

## Ordered Implementation Steps
1. Rename `ai_workspace/roles/05_summarizer.md` → `05_documenter.md`. Update internal title, send-back role reference, and output filename (`05_summarizer_complete.md` → `05_documenter_complete.md`).
2. Update `project_context.md`: "Summarizer" → "Documenter" in role list (line 4) and design decision note (line 21).
3. Update `roles/03_worker.md`: guardrail text referencing Summarizer's job.
4. Update `roles/04_tester.md`: send-back route ("Summarizer (Role 05)") and guardrail text.
5. Update `roles/06_reviewer.md`: input filename (`05_summarizer_complete.md` → `05_documenter_complete.md`) and two mentions of "the Summarizer".
6. Update `roles/07_finalizer.md`: checklist mention of Summarizer.
7. Update `transition_guide.md`: pipeline diagram ASCII art and text example referencing Summarizer.
8. Verify: grep for any remaining "summarizer" or "Summarizer" strings — should be zero.

## Risks and Open Questions
None significant. The ASCII diagram in the transition guide requires careful spacing preservation but is straightforward find-and-replace.
