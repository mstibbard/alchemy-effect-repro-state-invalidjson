---
name: project-commits
description: Use when preparing, staging, creating, amending, or reviewing git commits in this repository. Ensures commits are Conventional Commits and are broken into discrete logical pieces where appropriate.
---

# Project Commit Workflow

When asked to commit changes in this repository:

1. Inspect `git status --short` and the relevant diff before staging or committing.
2. Preserve user changes. Do not revert, discard, or overwrite unrelated work unless explicitly asked.
3. Split changes into discrete logical commits when the diff contains separable concerns, such as implementation, tests, docs, formatting, or independent fixes.
4. Keep each commit internally coherent: staged files and hunks should support one purpose.
5. Use Conventional Commit messages:
   - `feat(scope): summary`
   - `fix(scope): summary`
   - `docs(scope): summary`
   - `test(scope): summary`
   - `refactor(scope): summary`
   - `chore(scope): summary`
6. Use a short, imperative, lowercase summary after the type/scope.
7. Add a body only when it clarifies non-obvious motivation, risk, migration steps, or verification.
8. Run the smallest relevant verification before committing when practical, and mention any verification that was skipped.

If the requested commit spans unrelated changes and the right split is ambiguous, propose the split before committing.
