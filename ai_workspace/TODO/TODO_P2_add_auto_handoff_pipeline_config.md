## Add auto_handoff pipeline config option and reorder config items

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-07-15
- **Context:** Out of scope for the current loop (git log depth calculation). User requested a new pipeline configuration item to control auto role handoff behavior, plus reordering existing config items.

## Description

Update the pipeline configuration system to include a new `auto_handoff` option and reorder all config items:

1. **Add `auto_handoff={true|false}`** as a new pipeline config key-value pair on line 3 of `loop_state.md`. This controls whether roles auto-handoff after completion or wait for user confirmation before transitioning.
2. **Reorder the config line** from current order (`skip_docs | test_level`) to:
   ```
   auto_handoff={true|false} | test_level={quick|deep|skip} | skip_docs={yes|no}<br>
   ```
   This better reflects their actual order in the pipeline flow.
3. **Update `02_planner.md`** so the Planner prompts the user for the auto_handoff mode during its "Ask Pipeline Configuration Questions" task (alongside existing skip-docs and test-level questions).
4. **Update all downstream roles** that read line 3 config to parse the new ordering correctly (any role that strips/parses key-value pairs from line 3).
5. **Update `transition_guide.md`** pipeline configuration section to reflect the new config format, including auto_handoff in the example and any parsing instructions.

## Notes

- The Planner should present auto_handoff as a binary choice following the existing "Option A (recommended) or Option B?" convention.
- Consider whether `true` or `false` is the recommended default — likely `true` since auto-handoff is the current behavior.
- Any role that currently reads line 3 config values should be audited for parsing changes needed due to the reordering.
