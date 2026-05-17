# Blocks Convention — Wave 06

## Block Types (25+)
paragraph, heading_1/2/3, bulleted_list, numbered_list, todo, toggle, quote,
callout, divider, code, image, video, audio, file, embed, bookmark,
column_list, column, database_inline, synced_block, template_button,
table_of_contents, page_link, vault_inline.

## Rules
- Every mutation requires `Idempotency-Key` header (min 16 chars).
- No SQL in route handlers — use block-repo.ts.
- DOMPurify server-side on all content_json before DB insert.
- Soft delete only (is_deleted = true) — no hard delete of blocks.
- Vault blocks never enter AI context.
- BlockEditor import allowed ONLY in `notes/` routes.

## Position
Fractional double precision. Between: `(prev+next)/2`. Append: `max+1000`. Gap < 0.001 → renormalize via RPC.

## Depth
Max 50 levels. Enforced via DB CHECK constraint.

## Version History
Every UPDATE triggers insert into block_versions. Auto-prune at 50/block.
