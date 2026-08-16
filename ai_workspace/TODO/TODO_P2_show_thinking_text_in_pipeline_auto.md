## Show Thinking Text in Pipeline-Auto (Optional Flag)

- **Captured by:** Interviewer (Role 01)
- **Date:** 2026-08-16
- **Context:** Requested during the pipeline-auto extension edit loop (blank-line compression, steering input, low-context auto-restart). User explicitly deferred this item to a TODO ("3 and 4 can be todos") to keep that loop focused on stream-control features.

## Description

Add a `--thinking` flag to `/pipeline-auto`, defaulting off so current behavior is unchanged. When enabled, sub-agent thinking text should stream live line-by-line similar to how regular (non-thinking) output already streams, but rendered:

- **Indented** relative to normal output lines
- **Grey color** to indicate thinking
- **No prefix of any kind** — no emoji/marker prefix and no `[N.Nk/T.Tk (P.P%)]` token-usage prefix

## Notes

- Hook point already exists: the RPC stream delivers `thinking_delta` events; current code drops them silently (explicit comment in the `message_update` switch in `.pi/extensions/pipeline-auto.ts`: "thinking_delta, text_start, text_end, etc. — silently handled").
- Regular output streaming is implemented via `textBuffer` + `flushBufferedLines()` in the same file — thinking display would follow a similar line-buffering approach per user's "line by line" requirement.
- User's exact spec from interview: indented + grey, no prefix, opt-in flag on `/pipeline-auto`.
