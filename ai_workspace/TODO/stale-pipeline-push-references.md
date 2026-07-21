# Stale References to `pipeline-push` After Renaming to `pipeline-auto`

**Created by:** Tester (Role 04) — 2026-07-21
**Context:** External refactor replaced `.pi/extensions/pipeline-push.ts` with `.pi/extensions/pipeline-auto.ts`. Role files and project overview still reference the old name.

## Items to Update

1. **`ai_workspace/roles/02_planner.md` line 34** — Says `/pipeline-push`, should be `/pipeline-auto`
2. **`ai_workspace/roles/03_worker.md` line 25** — Mentions "pipeline-push", should say "pipeline-auto"
3. **`ai_workspace/project_overview.md`** — Multiple references to `pipeline-push` throughout. Should be updated to reflect the new extension name and RPC-mode architecture.

## Priority

Medium for role files (functional impact: Planner instructions reference a non-existent command). Low for project overview (informational only, but should stay current).
