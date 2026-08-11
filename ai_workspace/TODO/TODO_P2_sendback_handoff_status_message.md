## Extension Missing "Ready for Handoff" Message During Send-Back

- **Captured by:** Worker (Role 03)
- **Date:** 2025-08-11
- **Context:** User noticed that during a send-back handoff, the extension status does not display the "ready for handoff" message. This is out of scope for the current Second Opinion fix loop — captured for a future pipeline run.

## Description

Investigate and fix why the extension TUI/status bar does not show the "ready for handoff" message when a role completes its send-back work and transitions to the next role. Normal (non-send-back) handoffs may work correctly — the issue appears specific to send-back mode transitions.

## Notes

- Likely related to transition logic in the extension code that handles `(in-sendback)` state differently from normal state.
- Check how the TUI status message is triggered during `loop_state.md` handoff line updates.
- May involve `transition_guide.md` flow vs. actual extension implementation mismatch.
