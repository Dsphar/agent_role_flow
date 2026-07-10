## Goal Summary
Enforce return-to-role after capturing TODOs in AGENTS.md

# Reviewer Complete — Quality Gate for Return-to-Role Rules

## Overall Assessment
**Clean, well-executed meta-change.** The Worker added two concise behavioral rules to `AGENTS.md` under "During a Role Session" that directly address the problem: agents drifting off after capturing TODOs. The change is minimal in scope (~2 bullets), placed where it's naturally encountered mid-task, and introduces no conflicts with existing pipeline flows.

## Issues Found

### Critical
None.

### Warnings
1. **W1 — Behavioral effectiveness unproven.** These are text-only instruction changes with no enforcement mechanism. Their real-world impact can only be measured through actual pipeline runs. The Documenter's early transition *in this very loop* (before these rules existed) demonstrates the problem was real, but we won't know if the fix works until a future loop exercises it.
   - *Recommendation:* Accept as-is. This is inherent to instruction-based guardrails — trust that explicit rules improve compliance over implicit ones.

### Suggestions
1. **S1 — Consider a self-referential example.** The bullets could include a brief inline example like `e.g., "Noted, logging to todo.md" then resume` to model the exact acknowledgment behavior expected. This would reduce ambiguity further.
   - *Recommendation:* Deferred as TODO in `ai_workspace/todo.md`.

## Strengths
- **Placement is excellent.** Under "During a Role Session" — exactly where agents reference their working behavior mid-task, not buried in startup or transition sections.
- **Two complementary rules.** The first says *what to do* (resume immediately), the second says *what not to do* (don't treat TODO capture as task completion). Together they close both failure modes.
- **No bloat.** ~90 words added total, consistent with existing bullet style and tone.
- **Zero regression risk.** No interaction with send-back flow, role detection, or transition logic. All 12 Tester validations pass cleanly.
- **Proper cleanup.** Worker removed the completed TODO from `todo.md` as planned.

## Recommendation
**Ship as-is.** Zero critical issues, one minor warning about unproven behavioral effectiveness (inherent to this type of change), and one suggestion deferred as TODO. Ready for Finalizer.
