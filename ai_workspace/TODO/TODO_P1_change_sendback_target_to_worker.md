## Change Send-Back Target from Planner to Worker

- **Captured by:** Planner (Role 02)
- **Date:** 2026-07-17
- **Context:** User feels that sending back to the Planner wastes time. The send-back flow should route directly to the Worker instead, with the Worker responsible for asking clarifying questions during sendback parsing if needed.

## Description

Update the send-back functionality so that:

1. **Send-back routes to the Worker (Role 03), not the Planner (Role 02).** When a Tester sends work back, the pipeline should loop back to the Worker rather than going through the Planner again.
2. **Worker handles clarification.** During sendback parsing, if the Worker needs more information about what to fix, it should proactively ask the user for clarification instead of deferring that to the Planner.
3. **Update relevant skill files and guides** — likely `sendback_guide.md`, `04_tester.md` (handoff targets), `03_worker.md` (sendback parsing behavior), and any routing/transition logic that references the send-back target role.

## Notes

- This is a pipeline design change affecting how the loop handles bugs found during testing.
- The rationale is efficiency: the Worker already has implementation context and can act on bug reports directly without re-planning.
- May need to update the routing matrices in `AGENTS.md` if send-back is referenced there.
