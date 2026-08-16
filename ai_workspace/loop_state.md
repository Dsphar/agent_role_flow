**Goal Summary:** Pipeline-auto: blank-line condensation, live steering input, low-context auto-restart<br>
**Current Role:** Worker (Role 03) | History: Interviewer → Planner<br>
**Pipeline Config:** test_level=deep | do_docs=true | can_loop=true<br>

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

---
## Planner (Role 02) — Complete

### Pre-Plan Questions
No clarifying questions were needed before planning — the Interviewer summary was thorough, and its open design questions (compaction reachability, TUI input semantics) were resolved by direct investigation of pi's RPC protocol docs (`docs/rpc.md`), compaction docs (`docs/compaction.md`), and the extension API type definitions (`dist/core/extensions/types.d.ts`). Key findings:
- **Compaction reachability:** pi auto-compacts when `contextTokens > contextWindow - reserveTokens`; default `reserveTokens = 16384`. Under default settings, remaining tokens never reach 10k before compaction preempts — a stats-only "<10k" trigger would be dead code. A `compaction_start`-based trigger (reasons `threshold`/`overflow`) is the signal that actually fires; dual-trigger design covers both paths.
- **TUI input semantics:** pi's extension API exposes an `input` event fired on every user prompt before agent processing; handlers may return `{action: "handled"}` to consume it entirely (no LLM turn starts). This is the clean hook for flag-free steering. RPC's native `streamingBehavior: "steer"` delivers mid-run messages after the current turn's tool calls finish, before the next LLM call — a safe reaction boundary.

### Architecture Overview
All work lands in the single existing file `.pi/extensions/pipeline-auto.ts` (~675 lines). No new files, no new dependencies (Node builtins only). Six decisions drive the design:

1. **Single-file implementation.** The extension is already a self-contained unit with clear internal layers (module state → helpers → `runSubAgent` closure → command handler → export). Adding ~100 lines keeps cohesion; splitting into modules would be premature for this size.
2. **Event-interception pattern for steering.** pi fires an `input` event on every user prompt before agent processing, and a handler may return `{action: "handled"}` to consume it entirely (no LLM turn starts). This is the only clean hook that satisfies the "plain TUI text, no flag or prefix" requirement. Alternatives rejected: a `/steer <text>` command (violates "no special syntax"); polling editor contents via `ctx.ui.getEditorText()` (hacky, degraded in RPC mode).
3. **`streamingBehavior: "steer"` for both steering and wind-down messages.** pi's native mid-run message queue — delivered after the current assistant turn finishes executing its tool calls, before the next LLM call. Alternatives rejected: `"followUp"` (delivered only when the agent fully stops — too late for wind-down, since stdin closes on `agent_end`); plain prompt with no behavior (RPC returns an error while streaming).
4. **Dual-trigger wind-down, once per session.** Trigger A: stats poll shows `contextWindow - tokens < 10,000`. Trigger B: `compaction_start` event arrives with reason `"threshold"` or `"overflow"`. Whichever fires first sends the warning; a per-session flag prevents repeats. Under default settings (`reserveTokens = 16384`) pi auto-compacts at ~16.4k remaining, so Trigger A alone would never fire under defaults; Trigger B guarantees activation and Trigger A covers custom settings where `reserveTokens < 10k`. Consequence: effective wind-down point is ~16.4k remaining under default settings (earlier than the literal 10k spec) — the only configuration-independent way to make the feature fire. Rejected alternative: disabling auto-compaction for sub-agents (`set_auto_compaction {enabled:false}`) to hit exactly 10k — removes pi's overflow-recovery safety net.
5. **Single emission helper for condensation.** One `emitLine()` used by both existing flush paths and also for pending tool-result lines (so they correctly reset the collapse state). The blank-line rule and token-prefix logic live in exactly one place.
6. **Guarded module-level handle for cross-closure access.** The `input` handler lives outside `runSubAgent`'s closure, so a small module-level `_activeSubAgent = { stdin, ended } | null` handle is the minimal shared surface — following the file's existing convention of `_`-prefixed module state with explanatory comments.

### File/Module Map
| File | Action | Contents |
|------|--------|----------|
| `.pi/extensions/pipeline-auto.ts` | **Modified** (only code change) | All three features: emission helper + condensation flag; wind-down triggers + message; `_pipelineRunning` / `_activeSubAgent` / pending-steer-id state; `input` event handler; steer-response handling in `processLine`; updated `printHelp()` text |
| `README.md` | *Not touched by Worker* | Documented by the Documenter (Role 05) per routing matrix (`do_docs=true`) — new user-facing interaction pattern needs README/help coverage there |

### Ordered Implementation Steps
**Step 1 — Blank-line condensation (sub-goal 1)**
Inside `runSubAgent`'s closure: add a `lastWasCondensedDash` boolean and an `emitLine(line)` helper implementing the rule — blank line (empty or whitespace-only): if the previous emitted line was already a condensed dash, skip; otherwise emit `-` (no token prefix) and set the flag. Non-blank line: reset the flag, apply existing prefix logic, emit. Route all streamed emissions through it: complete lines in `flushBufferedLines`, the trailing remainder in `flushAllBufferedText`, and pending tool-result lines.
*Expected outcome:* in a live run, every blank line in sub-agent text appears as exactly one `-` line; runs of N consecutive blanks collapse to one `-`; no real blank lines anywhere in streamed sections; session headers, compaction messages, and other console output are untouched (they use separate `console.log` calls).

**Step 2 — Low-context wind-down (sub-goal 3)**
Inside `runSubAgent`: add a per-session `windDownSent` flag and a `sendWindDown(reason)` function that prints an orchestrator notice (e.g. `⚠ Low context detected (…) — sending wind-down instruction…`) and sends an RPC prompt with `streamingBehavior: "steer"` carrying the wind-down message, using a unique id. Proposed message wording (flexible): *"Context is nearly exhausted. Stop starting new work immediately. Update ai_workspace/loop_state.md now with your current progress — update the Current-Role Steps checkboxes in your role's summary section and add any inline notes a fresh session needs to resume. Then end your stream; do not transition to another role. A new session will pick up from loop_state.md."*
Trigger A: in the `get_session_stats` response handler, after state updates — if `!windDownSent` and tokens/window are non-null and `(window - tokens) < 10000`, call `sendWindDown`. Trigger B: in the existing `compaction_start` handler — read `parsed.reason`; if `!windDownSent` and reason is `"threshold"` or `"overflow"`, call `sendWindDown`.
*Expected outcome:* exactly one wind-down prompt per session, on first trigger; the sub-agent saves progress to `loop_state.md` and ends its stream; the orchestrator's *existing* loop then spawns a fresh session that resumes the same role from inline progress tracking — no new restart machinery.

**Step 3 — Live steering input (sub-goal 2)**
Module-level: `_pipelineRunning` boolean, `_activeSubAgent = { stdin, ended } | null`, and a small set of pending steer ids. In `runSubAgent`: assign the handle after spawn; mark `ended` on `agent_end`; clear to null on all resolve/exit paths (guaranteed via finally). In the command handler: set `_pipelineRunning = true` right after the `can_loop` guard passes; wrap the session loop in try/finally so the flag always resets. Register a `pi.on("input", …)` handler in the default export with this decision chain:
- not `_pipelineRunning`, or input source not `"interactive"` → return `{action: "continue"}` (normal behavior — feature inert when pipeline isn't running);
- text starts with `/` or `!` → return `{action: "continue"}` (TUI commands and inline-bash pass through untouched — forwarding command syntax into a sub-agent could be harmful, e.g. nested `/pipeline-auto`);
- active sub-agent exists and not ended → send RPC prompt (`streamingBehavior: "steer"`, tracked id), echo visibly in the orchestrator console (e.g. `🎯 Steering → <text>`, visually distinct from token-prefixed sub-agent lines), return `{action: "handled"}`;
- no active session (brief between-sessions window) → print a notice that text wasn't forwarded, return `{action: "handled"}`.
In `processLine`: handle `response` events for command `"prompt"` whose id is in the pending set — remove it; on `success: false`, print a ⚠ warning line (covers e.g. typing just as the sub-agent ends).
*Expected outcome:* during a live run, plain TUI text reaches the active sub-agent at its next turn boundary and is echoed visibly; it never starts an LLM turn in the orchestrator session; slash/`!` input behaves exactly as before; with the pipeline not running, TUI behavior is unchanged.

**Step 4 — Help text update**
Extend `printHelp()` with sections describing the two new user-facing behaviors: plain-text steering during a run (echo, delivery timing at turn boundaries, `/` and `!` pass-through) and low-context wind-down (auto-instruction to save state + end, fresh-session continuation).
*Expected outcome:* `/pipeline-auto --help` documents the new behaviors.

### Testing Strategy Overview
No test infrastructure exists in this repo, so deep testing = structured live runs against a checklist:
1. **Reload prerequisite:** restart the orchestrator pi process first — extension code loads at startup, so edits don't take effect mid-session.
2. **Condensation:** run `/pipeline-auto`; verify blanks → single `-` lines, no real blanks in streamed sections, headers/compaction output unaffected.
3. **Steering:** during a live sub-agent turn, type plain text (e.g. "reply with the word BANANA and continue") — verify 🎯 echo + visible compliance at next turn boundary. Edge cases: `/`-command pass-through; `!`-bash pass-through; text typed in the between-sessions window (notice); normal TUI use with pipeline not running (unchanged).
4. **Wind-down:** under default settings, run a context-heavy role until the wind-down notice appears (exercises Trigger B — compaction path, since defaults compact at ~16.4k remaining). Verify: one warning only; sub-agent updates `loop_state.md` progress and ends; next session resumes the same role from inline tracking. To exercise Trigger A (stats <10k), temporarily create `.pi/settings.json` with `compaction.reserveTokens = 8000`, repeat, then delete the file to restore state.
5. **Regression:** features not exercised → behavior identical to before this loop.

### Dependencies & Rollback
Steps 1–3 are independent of each other (all in one file); Step 4 last since it documents final behavior. Rollback is trivial — a single-file change with no state or schema migration; reverting the Worker commit restores prior extension behavior exactly.

### Project Conventions to Respect
- Single-file extension, Node builtins only, no new dependencies.
- Existing patterns: `_`-prefixed module state with explanatory comments; closure-local state inside `runSubAgent`; all RPC writes through `sendRpcCommand(stdin, cmd)`; emoji marker style already in use (🛠 ✅ ❌ 🔄 ⚠ ✓).
- Worker lane constraints: no test files, no project documentation (README is the Documenter's), no version control beyond the mandatory transition commit.

### Risks and Open Questions
1. **Effective wind-down threshold is ~16.4k remaining under default settings**, not the literal 10k spec (architecture decision #4). If exactly-10k matters, the alternative is disabling auto-compaction for sub-agents — Planner recommends against it (loses overflow recovery).
2. **Small-window local model** (user's default is a 27B via LM Studio): wind-down may fire frequently — each firing costs one extra session spawn + state save, consuming the `MAX_SESSIONS = 50` budget faster. Self-limiting and arguably desirable (local models degrade with long context), but worth watching in practice; tunable later via settings if too chatty.
3. **Steering lands at turn boundaries**, not mid-tool-call — inherent to pi's steer queue, documented behavior rather than a bug.
4. **Assumption to verify first:** the `input` event fires for prompts typed while the long-running `/pipeline-auto` handler is active (pi's lifecycle diagram supports this; the TUI stays responsive during command execution). If it doesn't, steering won't work and Worker should escalate — but the first test step catches this immediately.
5. **Steer sent just as a sub-agent ends** may be rejected (`success: false`) → console warning only, no crash (handled by design in Step 3).
6. **Cosmetic:** a literal `-` content line (markdown list) followed by a blank can render two consecutive dashes — inherent to the dash-as-separator convention; not worth special-casing.

### Approval Status
Approved on first print (user: "ok") — no iterative revisions required. Phase 1 pre-plan questioning auto-skipped per role file guidance (no helpful questions arose after review).
