# Planner Phase 1 Section Ordering Fix

## Context
Reviewer (Role 06) flagged during loop "Add pre-plan question rounds to Planner, reorder transition write order".

## Description
In `ai_workspace/roles/02_planner.md`, the new "Phase 1: Ask Clarifying Questions Before Planning" section is placed after "Break Down into Ordered Steps" (around line 35). The section title says it should happen *before* planning, but its position in the file suggests it comes after steps are already drafted. An LLM reading top-to-bottom could execute Phase 1 too late, defeating its purpose.

## Recommended Fix
Move "Phase 1: Ask Clarifying Questions Before Planning" to appear before "Define Architecture and Structure" (or at least before "Break Down into Ordered Steps"). Alternatively, add an explicit note that Phase 1 executes first despite file position.

## Severity
Warning — not blocking but could cause incorrect behavior in practice.
