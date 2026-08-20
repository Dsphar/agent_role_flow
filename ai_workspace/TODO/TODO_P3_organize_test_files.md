## Organize Test Files Into Dedicated Folder

- **Captured by:** Tester (Role 04)
- **Date:** 2025-08-20
- **Context:** User requested cleaning up test files scattered across the project root. Out of scope for Tester role — this is a project organization task, not testing validation work.

## Description

Move or delete the following test files currently crowding the project root:

- `scratch_test.js`
- `test_pipeline_auto_features.js`
- `test_pipeline_push.js`
- `test_sendback.js`
- `test_toolcall_streaming.js`
- `test_unit_deep.js`

Options to present to user when this is picked up:
1. **Move into a folder** — create something like `tests/` or `test_archive/` and move all `.js` test files there.
2. **Delete entirely** — if these are no longer needed, remove them permanently.

## Notes

User preference unclear on delete vs. move — confirm with user when this item is addressed.
