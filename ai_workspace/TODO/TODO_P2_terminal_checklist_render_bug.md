## Terminal checklist rendering has formatting issues

- **Captured by:** Documenter (Role 05)
- **Date:** 2026-07-21
- **Context:** User reported a visual bug in the pi TUI terminal when the extension renders checklist-style output. Out of scope for Documenter — not part of documentation work.

## Description

When `pipeline-auto.ts` (or another extension) outputs checklist/step results to the terminal, the formatting is broken. Checkmarks and labels appear on separate lines instead of inline together. Example observed by user:

```
**Step 1: TypeScript compilation / syntax validation**

 ✅
 ✅
 ✅
 ✅
```

Expected behavior would be something like:
```
**Step 1: TypeScript compilation / syntax validation**
✅ Passed
✅ Passed
...
```

Investigate whether this is:
- A markdown rendering issue in the pi TUI terminal (how `✅` or `[x]` checklist items are rendered)
- An issue with how the extension formats its output strings before sending to the terminal
- A newline/whitespace problem in the message content being streamed

## Notes

- User noted "Not sure if it is md formatted or not" — may need to check what format the extension sends and how pi's TUI interprets it.
- The extension uses `message_update/text_delta` events for streaming text. Check if markdown checklist syntax (`[x]`, `- [ ]`) is being sent and whether the TUI renderer handles it correctly.
- Relevant files: `.pi/extensions/pipeline-auto.ts` (extension output logic), pi TUI rendering code in `@earendil-works/pi-coding-agent`.
