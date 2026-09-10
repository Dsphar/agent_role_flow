# TODO — Fix stale import path in scratch test

## Fix stale import path in tests/scratch_test.js

- **Captured by:** Tester (Role 04)
- **Date:** 2026-09-10
- **Context:** During this loop's regression run, the Tester found that `tests/scratch_test.js` still imports the extension via `'./.pi/extensions/pipeline-auto.ts'` — a path that broke when test files moved into `tests/` (commit `ce78f98`). The file is labeled scratch/experimental in `project_overview.md`, so it was left untouched to keep this loop's scope tight.

## Description

Either fix or delete:
- **Fix:** change the import specifier to `'../.pi/extensions/pipeline-auto.ts'` (one line, same repair applied to the other suites this loop).
- **Delete:** if the scratch file has served its purpose (it was a manual import smoke-check for the pipeline-auto extension), remove it and drop its entry from `project_overview.md`'s File Structure.

## Notes

- Running it today prints "Import failed: ERR_MODULE_NOT_FOUND" but exits 0 (errors are caught, no exit code set) — so it never breaks a suite run; purely cosmetic until fixed or removed.
- The other four suites in `tests/` were all repaired this loop and pass (168 tests green).
