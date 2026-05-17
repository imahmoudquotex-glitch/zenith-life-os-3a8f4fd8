# Block Versioning Convention — Wave 06

## How It Works
Every UPDATE on `blocks.content_json` triggers an INSERT into `block_versions`.

```sql
-- Trigger fires on UPDATE of content_json
CREATE TRIGGER trg_blocks_version
  AFTER UPDATE OF content_json ON blocks
  FOR EACH ROW EXECUTE FUNCTION capture_block_version();
```

## Prune Policy
- Max 50 versions per block.
- Prune trigger fires after INSERT into block_versions.
- Deletes oldest versions when count > 50.

## Restore Flow
1. User opens "History" from block menu.
2. Sees list of versions (timestamp + editor name).
3. Preview: renders old content_json without saving.
4. Restore: takes Idempotency-Key → PATCH /api/blocks/:id with old content.
5. Snapshot of current version saved BEFORE restore (no data loss).

## Version Retention
- All versions for last 30 days always kept.
- Beyond 30 days: only last 50 versions retained.
