# Supabase schema reference snapshot

Current state of the TokenLens Supabase schema after applying every
migration in supabase/migrations/. Update this file in the same PR as any
migration.

## Tables

### public.personal_state

Single-document store for personal sync (see
[Personal sync](../features/personal-sync.md)). One row with id
"singleton" per deployment.

| Column | Type | Notes |
|---|---|---|
| id | text | Primary key. Always "singleton". |
| doc | jsonb | The PersonalState document (schemaVersion, watchlist, positions, assetTiers, updatedAt). Validated by lib/server/personal.ts on read and write. |
| updated_at | timestamptz | Row-level write timestamp, refreshed by trigger. Observability only: last-write-wins uses doc.updatedAt. |

- RLS: enabled, no policies. Only the service role key (server-side env
  var, never client-exposed) can read or write.
- Trigger: personal_state_touch keeps updated_at fresh on update.

## Migrations applied

| File | Purpose |
|---|---|
| 20260722000000_personal_state.sql | Create personal_state, enable RLS, add touch trigger |
