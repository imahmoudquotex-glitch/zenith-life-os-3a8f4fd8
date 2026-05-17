# Synced Blocks Convention — Wave 06

## What is a Synced Block?
A `synced_block` mirrors the content of another block (`source_block_id`).
Any edit to the source automatically reflects in all synced references.

## DB Schema
```sql
-- content_json of a synced_block:
{ "source_block_id": "<uuid>" }
```

## Cycle Prevention
Before inserting a synced_block, `detectCycle()` runs on the full block graph.
Also enforced via DB trigger `assert_no_synced_cycle`.

Algorithm: DFS from source_block_id. If any path leads back to the new block → REJECT.

## UI Indicators
- Synced block shows "Synced from [page name]" badge.
- Click badge → jump to source block.
- Source block shows "Referenced in N places".

## Rules
- Max chain depth: 1 (no synced-of-synced for now → ADR-0092).
- Vault blocks cannot be synced.
- Synced blocks are read-only in reference context.
