# 03 — Worker Complete

## Summary
Consolidated send-back cleanup logic into a single source of truth.

## Changes Made
- **Modified `AGENTS.md`:** Replaced detailed cleanup instructions in Send-Back Detection step 4 with a pointer to the Worker role (`03_worker.md`). The duplicated bullet points about deleting `send_back_to_worker.md` and `_complete.md` files were removed.
- **No changes to `ai_workspace/roles/03_worker.md`:** Already contained complete cleanup logic — confirmed as-is.

## Files Modified
| File | Action |
|------|--------|
| `AGENTS.md` | Modified — Send-Back Detection step 4 trimmed to reference Worker role |

## Success Criteria Met
- [x] Cleanup logic exists in exactly one place: `03_worker.md`.
- [x] AGENTS.md references the Worker role for cleanup details without duplicating them.
- [x] No behavioral change — same files get deleted, same conditions apply.
