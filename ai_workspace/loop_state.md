**Goal Summary:** Pipeline-auto: blank-line condensation, live steering input, low-context auto-restart<br>
**Current Role:** Planner (Role 02) | History: Interviewer<br>
**Pipeline Config:** test_level=deep | do_docs=true | can_loop=false<br>

---
## Interviewer (Role 01) — Complete

### What Is Being Built or Changed
Edits to the `pipeline-auto` extension (`.pi/extensions/pipeline-auto.ts`) across three sub-goals:

1. **Blank-line condensation** — In streamed sub-agent text output, every blank line becomes a `-` line; a run of consecutive blank lines collapses into exactly one such line. No real blank lines appear in streamed output at all. Scope is limited to the streamed buffer dump — session headers, compaction messages, and other console output are unaffected.
2. **Live steering input** — While the pipeline is running, the user types normally into the TUI (no flag, prefix, or special command) and typed text is forwarded to the active working sub-agent session. The orchestrator console echoes each forwarded message visibly.
3. **Low-context auto-restart** — When a session has fewer than 10,000 tokens left in context, the extension automatically sends it a warning (wording flexible per user) instructing it to quickly update `loop_state.md` with current work and end its stream. The orchestrator's existing loop then spawns a fresh session that picks up where the previous one left off — no new restart machinery beyond sending the message.

### Why It Matters / Background & Motivation
- Excessive blank lines between status updates clutter the live console output during long auto-runs.
- The user currently cannot influence a running sub-agent session; steering input makes unattended runs correctable without interruption.
- Sessions that hit their context limit risk losing in-progress work; graceful wind-down with state saved to `loop_state.md` plus automatic fresh-session continuation prevents that loss (roles are already resumable via inline progress tracking).

### Success Criteria / Acceptance Conditions (as stated by user)
- All three behaviors work in a live `/pipeline-auto` run.
- Current behavior is unchanged when the new features are not exercised.
- Blank-line rule: consecutive blanks → exactly one `-` line; lone blank → `-` line (no real blanks at all).
- Steering: plain TUI text entry, no special syntax; forwarded messages echoed in orchestrator console.
- Low-context trigger fires below 10,000 remaining tokens with a warning that directs the session to save state and end.

### Integration Points (user-mentioned only)
- The `pipeline-auto` extension / "orchestrator" — the component being edited.
- The TUI — where the user enters steering text.
- The active working sub-agent session — recipient of forwarded steering text and low-context warnings.
- `loop_state.md` — target of the wind-down state save (existing file, existing role-resume mechanism).

### User-Facing Behavior Changes
- New interaction pattern: typing during a run steers the active session; each forwarded message is echoed in the console.
- Streamed output renders `-` separator lines instead of blank lines.
- Sessions near their context limit wind down gracefully (state saved to `loop_state.md`) and continue in a fresh session.

### Technical Constraints & Preferences (as stated by user)
- Blank-line rule applies only to streamed sub-agent text, not other console output.
- Steering must require no flag or prefix — plain TUI input.
- Low-context warning wording is flexible ("or something similar"); core intent: save state to `loop_state.md`, end stream, auto-restart picks up.

### Edge Cases / Special Considerations (flagged for Planner)
- **Compaction interaction:** pi auto-compacts context and the extension already handles `compaction_start` events; auto-compaction may preempt the "<10k tokens left" state, making that exact trigger rare or unreachable. Planner should investigate reachability in RPC sub-agent sessions and pick trigger logic that actually fires (e.g., compaction-event-based). The warning should send once per session, not on every stats poll.
- **TUI input semantics:** how typed text reaches a long-running command handler (queueing/interrupt behavior) and when it lands in the sub-agent (mid-turn vs next turn) is an open design question for Planner.
- Leading/trailing blanks at stream start/end: apply the same rule; minor.

### Relevant File/Code References
- `.pi/extensions/pipeline-auto.ts` — the extension being edited (read during interview). Key existing hooks: `textBuffer` + `flushBufferedLines()` for streamed output; RPC stdin pipe + `prompt` command mechanism (used by kickoff); `get_session_stats` polling already tracks tokens/window/percent; `compaction_start` handling.

### TODO Captured This Session
- `TODO_P2_show_thinking_text_in_pipeline_auto.md` — thinking-text display (`--thinking` flag, indented grey lines) was requested then explicitly deferred by user to a TODO ("3 and 4 can be todos"). Mid-loop capture: not addressed this loop, so **no Worker deletion step is required**. A future loop that picks it up as a loop-start TODO will include the standard Planner→Worker deletion instruction.

### Clarification Log
- **Q:** What would you like to work on this loop?
  **A:** Edit the pipeline-auto extension: (1) when dumping the buffer, replace consecutive newlines with dashes instead of more blank lines, to avoid excessive blank lines between status updates; (2) assess how hard it would be to flag the extension so thinking text is shown line-by-line like actual output.
- **Q:** For a third or subsequent consecutive blank line — does only the second become `-`, or all of them? Does this apply only to streamed sub-agent text?
  **A:** All lines immediately following should be converted (e.g., "line / - / - / -"). Streamed output only. Also asked how hard it would be for the orchestrator to take steering input from the user and direct it to the working session.
- **Q:** What form should the thinking flag take? Visual treatment — distinguishable, token prefix?
  **A:** `--thinking` flag is fine; thinking lines indented, no prefix, grey color.
- **Q:** Disambiguation: A (first blank preserved as real blank) or B (all blanks become `-`, no real blanks)? Should steering be in this loop or deferred to TODO?
  **A:** B. Work steering into the loop. Also add auto-direction: when a session has less than 10,000 tokens of context left, auto-send a warning instructing it to update `loop_state.md` with current work and end its stream; orchestrator restarts a fresh session that picks up where it left off (wording flexible). Thinking display items ("3 and 4") deferred to TODO.
- **Q:** How does the user provide steering — normal TUI input or an explicit mechanism? Should forwarded messages be echoed in the console?
  **A:** Steer like normal — user just enters text into the TUI, no flag or prefix. Yes, orchestrator should echo visibly. Correction on blank-line rule: a series of blank lines condenses to a single dash line, not several dash lines.
- **Q:** Does the problem statement capture everything? Testing level (recommended Deep) and documentation (recommended Yes)?
  **A:** "ok" — confirmed; ambiguous response auto-selected recommended values: `test_level=deep`, `do_docs=true`.

### Pipeline Configuration Decisions
- `test_level=deep` — substantial changes to interactive TUI input handling and context-monitoring logic warrant a full test pass.
- `do_docs=true` — steering input is a new user-facing interaction pattern worth documenting (README/help text).
- `can_loop=false` — initialized by Interviewer; Planner sets it to true before transitioning.
