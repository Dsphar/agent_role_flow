# Code Quality Improvements for pipeline-auto.ts

**Created by:** Reviewer (Role 06) — auto-mode  
**Date:** 2026-08-16  

## Warning Items

### W1: `child: any` type on `_activeSubAgent`
The `_activeSubAgent` object stores the child process as `any`. Since `ChildProcess` is already imported from `node:child_process`, this should be typed properly.

**Fix:** Change `{ stdin: NodeJS.WritableStream; child: any; ended: boolean; ... }` to `{ stdin: NodeJS.WritableStream; child: ChildProcess; ended: boolean; ... }`.

### W2: Magic numbers — consider named constants
Several hardcoded numeric values appear in the code without named constants:
- `1500`ms timeout for filesystem flush (line ~730)
- `15000` token threshold for wind-down (appears twice)
- `20` char truncation limit for command args

**Fix:** Extract to module-level constants like `FS_FLUSH_DELAY_MS = 1500`, `WIND_DOWN_TOKEN_THRESHOLD = 15000`, `ARG_TRUNCATION_LIMIT = 20`.

### W3: Stale threshold in `printHelp()` text
The help text says "fewer than **10k** tokens remaining" but the actual code uses `15000` (15k). API_DOCS.md correctly documents 15k.

**Fix:** Update `printHelp()` string to say "15k" instead of "10k".

## Suggestion Items

### S1: Consistency in thinking_delta handler
The `thinking_delta` case uses direct `process.stdout.write("-")` for dash emission, while blank-line condensation goes through `emitLine()`. Consider routing through the same path for consistency.
