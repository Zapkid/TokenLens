# CLAUDE.md: working agreement for this repo

TokenLens. Read `docs/README.md` (index) and the feature docs before non-trivial work; if they do not exist yet, creating them is part of the first feature.

<!-- Fill in as the project takes shape: one-line product description, stack, where E2E lives. -->

## Documentation is part of "done"

- **Every feature ships with its docs in the same PR.** Never leave doc updates as a later chore.
- **New feature → new doc.** Create `docs/features/<feature>.md` with a consistent shape: Summary, Entry Points, Flow(s), Data Touched, Business Rules / Security, Edge Cases, Non-Goals. Add it to the index in `docs/README.md` and to the master overview in `docs/features-overview.md` (create both on first use).
- **Changed behavior → update the affected doc(s)** in the same PR, including any schema or config reference snapshots when persistent state changes.
- Keep copy free of em dashes everywhere (code strings and docs): use periods, commas, or colons; en dashes only for numeric ranges. This is grep-checkable, keep it that way.

## Every feature needs a test plan

For each feature, before it merges:

1. **Test cases**: write them down as a test-management case (Qase via the MCP when wired for this project; a `docs/test-plans/` file until then). The case lists the scenarios: happy path, permission boundaries, dedupe/idempotency, and edge cases.
2. **Automated tests**: cover the same scenarios:
   - **Unit / component** tests colocated with the code (`__tests__/`) for pure logic and UI behavior. Extract pure functions into a `lib/` layer so they are unit-testable. Every bug fix ships with a regression test.
   - **E2E** for user-facing flows and API-level security boundaries, tagged with the matching test-case id. Keep UI selectors in a single registry so a typo or a removed hook fails loudly, not as a mystery timeout.
3. A feature is not done until its tests pass. Run the full local gate (typecheck, lint, unit tests, build) before merging, plus a final build of merged `main`. Keep CI triggers conservative to conserve Actions minutes; prefer on-demand dispatch.

## Model + sub-agent strategy

- **Plan with the strongest model; execute with cheaper ones.** Do the analysis, architecture, task decomposition, security review, and final integration on the most capable model. Then **delegate well-scoped implementation tasks to sub-agents running less expensive models** (pass `model` on the Agent tool, e.g. a cheaper tier for mechanical implementation).
- Give each sub-agent an isolated worktree (`isolation: "worktree"`) when tasks touch overlapping files, a precise brief (files to read, conventions, selector/naming registries, the test + doc requirements above), and instructions to run the full local gate and push a branch (not open/merge PRs). Pre-build shared surfaces (types, shared libs, string catalogs) in a foundation branch first so agents never conflict on them.
- The planning model keeps ownership of: splitting work to minimize file conflicts, merging branches sequentially, resolving conflicts (union on append-only files like docs indexes and reference snapshots), and the final verification build. Do not delegate integration or the security-sensitive review.

## Workflow rules (learned the hard way)

- Always branch PRs off `main`; never stack on another open branch (it silently drops commits when the base merges first).
- Squash-merge and delete the branch; keep zero open PRs as the resting state.
- One PR per concern. When several PRs touch the same append-only files, merge one at a time and reconcile by union.
- Persistent-state changes (database, stored config): apply the migration, update the reference snapshot in the repo, and reload/restart whatever caches the schema in the same change.
- Secrets: privileged keys are local/CI only; nothing sensitive in client-exposed env vars (`NEXT_PUBLIC_`, `VITE_`, or equivalent); hash-and-show-once for issued API keys. Security-sensitive surfaces (auth, impersonation, admin) are env-gated and reviewed by the planning model, not delegated.
