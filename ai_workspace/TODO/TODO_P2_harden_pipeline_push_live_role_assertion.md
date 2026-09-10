# TODO — Harden live loop_state role assertion in test_pipeline_push.js

## Harden "Testing against actual loop_state.md" block in tests/test_pipeline_push.js

- **Captured by:** Tester (Role 04)
- **Date:** 2026-09-10
- **Context:** While repairing stale paths in `tests/test_pipeline_push.js` this loop, the Tester noted that its "Testing against actual loop_state.md" block asserts `getCurrentRole(actual) === "Tester"` against the *live* pipeline state file. It passes whenever the suite legitimately runs (Tester stage, including send-back mode where line 2 reads `Tester (in-sendback)`), but would fail spuriously if anyone ran the suite from another role's session (e.g., a Reviewer debugging).

## Description

Make the live-file check robust to which role is active:
- Assert on **format** rather than a specific value — e.g., extracted role matches `/^[A-Z][a-zA-Z ]*$/` and is one of the seven known pipeline roles, or simply that extraction returns a non-empty string for a well-formed line 2.
- Alternatively, skip the live-file block (with a printed note) when the current role is not Tester.

## Notes

- The synthetic-content tests above this block already cover `getCurrentRole()` behavior exhaustively (multi-word roles, send-back suffix, edge cases) — the live-file block is a thin integration check that the real file parses at all.
- Keep the try/catch structure; only the assertion criterion changes.
