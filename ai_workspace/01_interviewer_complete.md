## Goal Summary
Enforce return-to-role after capturing TODOs in AGENTS.md

# Interviewer Complete — Enforce Return-to-Role After Capturing TODOs

## What Is Being Changed
Add an explicit step in `AGENTS.md` instructing agents to immediately resume their current role's work after capturing an out-of-scope request into `ai_workspace/todo.md`.

## Why It Matters
Agents currently get distracted after logging a TODO and stop their main work. This breaks productivity and wastes pipeline cycles. A clear, explicit rule prevents the drift.

## Technical Constraints and Preferences
- Change lives in `AGENTS.md` only (cross-cutting pipeline rule).
- Must be an **explicit step/flow**, not just a casual reminder — e.g., "After appending to `todo.md`, acknowledge the capture briefly, then resume your last task."
- Applies universally to all 7 roles.
- Deliverable is the text change only — no full pipeline test run required.

## Edge Cases or Special Considerations
- Should not conflict with existing send-back flow (which also involves `send_back.md`). This rule applies specifically to `todo.md` captures.
- The step should be placed where it's naturally encountered during role work, not buried in a footnote.

## Origin
Item from `ai_workspace/todo.md`: "Enforce Return-to-Role After Capturing TODOs" (captured by Tester, 2026-07-10). Mark for removal upon completion.
