## Fix Ambiguous Parenthetical in init_project_guide.md Node.js .gitignore Patterns

- **Captured by:** Reviewer (Role 06)
- **Date:** 2026-07-20
- **Context:** During review of the `.gitignore` generation step added to `init_project_guide.md`, an ambiguous parenthetical was found in the Node.js patterns line. The text reads: `yarn.lock (if using npm)` which incorrectly suggests including `yarn.lock` when using npm. This is a minor clarity issue in guidance text, not a functional bug.

## Description

In `ai_workspace/skill_helpers/init_project_guide.md`, Step 4b, the Node.js line currently reads:
```
Node.js → node_modules/, npm-debug.log*, yarn.lock (if using npm), dist/, build/
```

The parenthetical "(if using npm)" is placed after `yarn.lock` but likely was intended to qualify `npm-debug.log*`. An AI following this guide might incorrectly interpret it as "include yarn.lock if using npm" — which is backwards. 

Fix options:
- Move the parenthetical: `npm-debug.log* (if using npm), yarn.lock (if using Yarn)`
- Or restructure to clearly separate package-manager-specific patterns.

## Notes

- Low priority since experienced users would likely catch this, but could mislead an AI agent following the guide literally.
