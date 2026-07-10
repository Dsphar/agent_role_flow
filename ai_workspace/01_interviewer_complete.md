# 01 — Interviewer Summary

## Goal Summary
Shared commit message summary across all pipeline roles

## What Is Being Built or Changed
Add a `## Goal Summary` heading to `01_interviewer_complete.md` containing a concise (<100 char) description of the current pipeline loop's goal. All subsequent roles read this summary and use it as the body portion of their transition commit messages (after `[ai-{role-name}] -- `).

## Why It Matters
Currently each role writes its own ad-hoc commit message, leading to inconsistent and vague commits across the pipeline. A single shared summary ensures every commit in a loop tells the same story.

## Technical Constraints and Preferences
- Summary must be <100 characters.
- Stored under `## Goal Summary` heading in `01_interviewer_complete.md`.
- AGENTS.md transition instructions updated so roles read from this file instead of writing their own.
- All 7 roles (Planner through Finalizer) use the shared summary.
- Fallback: if no interviewer summary exists, role generates its own ad-hoc summary as before.
- Summary is per-loop — naturally deleted at pipeline reset by the Finalizer.

## Originated From
This addressed TODO #2 from `ai_workspace/todo.md`: "Use Interviewer's Goal Summary for All Role Commit Messages". The Planner should plan its removal from the TODO list.
