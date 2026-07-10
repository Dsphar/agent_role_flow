## Goal Summary
Move in-progress file instructions from transition_guide to AGENTS.md

# Planner Summary — Move In-Progress Files Instructions to AGENTS.md

## Architecture Overview
Pure documentation relocation. No code, no structural changes beyond text movement across two files plus a todo cleanup.

### Key Decisions
- New subsection placed after "Conflict Check" in `AGENTS.md` — that's where `_in_progress.md` is already referenced at startup.
- Filename casing note stays in `transition_guide.md` but moves inline under the transition steps (no longer needs its own header once the main paragraph is removed).

## File/Module Map
| File | Action |
|------|--------|
| `AGENTS.md` | Add new "### In-Progress Files" subsection after "Conflict Check" |
| `ai_workspace/transition_guide.md` | Remove "In-Progress Files" paragraph; move casing note inline under transition steps; remove orphaned header |
| `ai_workspace/todo.md` | Remove completed item #1 ("Move In-Progress Files Instructions to AGENTS.md") |

## Ordered Implementation Steps

1. **Add new subsection to `AGENTS.md`.** Insert a `### In-Progress Files` heading and paragraph after the existing "Conflict Check" section (before "Send-Back Detection"). Content: describe the optional `{NN}_rolename_in_progress.md` pattern — that it can be created during a role for early notes, is temporary, and is renamed to `_complete.md` upon confirmation.

2. **Remove source paragraph from `transition_guide.md`.** Delete the "In-Progress Files" paragraph (the one describing the optional pattern) and its `### In-Progress Files` header.

3. **Relocate filename casing note in `transition_guide.md`.** Move the blockquote (`> **Filename casing note:** ...`) inline under step 4 of the transition steps (where `_complete.md` / `_in_progress.md` filenames are mentioned). Remove now-empty "### In-Progress Files" header if it becomes orphaned.

4. **Verify both files read cleanly.** Confirm no duplication with the Conflict Check text in `AGENTS.md`, and that `transition_guide.md` flows naturally without the removed section.

5. **Remove completed item from `todo.md`.** Delete the "Move In-Progress Files Instructions to AGENTS.md" entry (item #1) from the Pending list.

## Risks and Open Questions
- None identified — straightforward text relocation with clear source and destination.
