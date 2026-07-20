/**
 * Session Handoff Extension
 *
 * Lets the LLM call a tool to start a fresh session with no conversation
 * context. A simple kickoff message ("hi") is sent into the new session,
 * which triggers pi to ingest AGENTS.md and begin whatever workflow it defines.
 *
 * The LLM should use this when:
 * - It has completed its work and wants a clean slate for the next task
 * - Context is getting too large and a fresh start is cleaner than compaction
 * - A different workflow in AGENTS.md should take over
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const HANDOFF_COMMAND = "/session-handoff-exec";

/** In-memory flag set by the tool, consumed by agent_end handler. */
let pendingHandoff: string | null = null;

export default function (pi: ExtensionAPI) {
  // ── Session lifecycle logging (diagnostic) ─────────────────────────────────
  pi.on("session_start", async (_event, ctx) => {
    console.log(`[session-handoff] session_start: reason=${_event.reason}, file=${ctx.sessionManager.getSessionFile()}`);
  });

  // ── Agent-end handler: pre-fill the handoff command in the editor ──────────
  //
  // pi.sendUserMessage() delivers messages as conversation text to the agent,
  // NOT through command parsing. Commands only parse from actual terminal input.
  // So we can't programmatically trigger a session reset from a tool.
  //
  // Instead: when the handoff tool was called, pre-fill the editor with the
  // handoff command so it's ready for the user to submit (Enter) once pi is idle.
  pi.on("agent_end", async (_event, ctx) => {
    if (!pendingHandoff) return;

    const kickoffMessage = pendingHandoff;
    pendingHandoff = null; // consume the flag

    console.log(`[session-handoff] agent_end: pre-filling editor with handoff command`);

    // Pre-fill the editor so user just presses Enter to execute the handoff.
    ctx.ui.setEditorText(`${HANDOFF_COMMAND} ${kickoffMessage}`);
    ctx.ui.notify("Handoff ready — press Enter to start fresh session", "info");
  });

  // ── Command (has session control via ExtensionCommandContext) ──────────────

  pi.registerCommand("session-handoff-exec", {
    description: "Internal command used by the session_handoff tool to start a new clean session",
    handler: async (args, ctx) => {
      const kickoffMessage = (args && args.trim()) || "hi";
      const parentSession = ctx.sessionManager.getSessionFile();

      console.log(`[session-handoff] Command executed: kickoff="${kickoffMessage}", parent=${parentSession}`);

      try {
        const result = await ctx.newSession({
          parentSession,
          withSession: async (replacementCtx) => {
            console.log("[session-handoff] withSession callback — sending kickoff message");
            replacementCtx.ui.notify("New session started — handoff complete", "info");
            await replacementCtx.sendUserMessage(kickoffMessage);
          },
        });

        if (result?.cancelled) {
          console.log("[session-handoff] newSession() was cancelled by an extension");
          ctx.ui.notify("Session handoff was cancelled by an extension", "warning");
        } else {
          console.log("[session-handoff] newSession() completed successfully");
        }
      } catch (err) {
        ctx.ui.notify(`Session handoff failed: ${err instanceof Error ? err.message : String(err)}`, "error");
        console.error("[session-handoff] newSession() failed:", err);
      }
    },
  });

  // ── Tool (callable by the LLM) ─────────────────────────────────────────────

  pi.registerTool({
    name: "session_handoff",
    label: "Session Handoff",
    description:
      "Start a new conversation session with no context. Sends a simple message to trigger AGENTS.md ingestion and begin the workflow defined there. Use this when you have completed your work and want a fresh session to take over, or when context is too large and a clean start is better than compaction.",
    promptSnippet:
      "session_handoff(handoff_message) — Start a new clean session with no conversation history; sends a kickoff message that triggers AGENTS.md ingestion",
    promptGuidelines: [
      "Use session_handoff when all work in the current task is complete and you want to hand off to a fresh session.",
      "Use session_handoff when context is getting unwieldy and starting over with just AGENTS.md guidance is cleaner than compaction.",
      "session_handoff ends the current session — do not expect any further tool calls or responses in this session after calling it.",
    ],
    parameters: Type.Object({
      handoff_message: Type.Optional(
        Type.String({
          description:
            "Message to send into the new session. Defaults to 'hi'. Keep it brief — just enough to trigger AGENTS.md ingestion and start its workflow.",
        }),
      ),
    }),

    async execute(_toolCallId, params, _signal, _onUpdate) {
      const message = (params.handoff_message && params.handoff_message.trim()) || "hi";

      // Set the flag. agent_end will pre-fill the editor with the handoff command.
      pendingHandoff = message;

      return {
        content: [
          {
            type: "text",
            text: `Session handoff ready. The editor has been pre-filled with "${HANDOFF_COMMAND} ${message}". Press Enter to start a fresh session with 0% context. This will trigger AGENTS.md ingestion and begin its workflow. No further work can be done in this session after you press Enter.`,
          },
        ],
        details: { handoff_message: message },
      };
    },
  });
}
