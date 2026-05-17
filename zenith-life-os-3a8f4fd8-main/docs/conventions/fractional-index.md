# Fractional Index Convention — Wave 06

## Algorithm
- Position type: `DOUBLE PRECISION` in PostgreSQL.
- Insert between: `position = (prev + next) / 2`.
- Append: `position = max_position + 1000`.
- Prepend: `position = min_position - 1000` (or `min_position / 2` if min > 1).
- Initial position (first block): `1000.0`.

## Renormalize
When gap between two adjacent positions < 0.001:
- `reorder_block` RPC detects collision.
- Re-spaces all blocks on page: `position = ROW_NUMBER() * 1000`.
- Renormalize is atomic within a transaction.

## Client Rules
- Never hardcode position numbers.
- Always re-fetch blocks after any reorder operation.
- Client computes optimistic position via `generatePositionBetween()` from `fractional-index.ts`.

## Limits
- Float64 precision: ~15 significant digits → supports ~10^9 insert/split operations before renormalize.
