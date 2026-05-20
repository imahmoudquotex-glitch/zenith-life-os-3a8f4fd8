-- File: 0104__page_tree_helpers.sql
-- Wave: 02
-- Description: Recursive CTE helper functions for page tree traversal
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

-- ─── Descendants ──────────────────────────────────────────
-- Returns all descendant page IDs and their depth from a root page.
-- Max depth = 50 to prevent infinite loops.
-- Cycle detection via path array.
CREATE OR REPLACE FUNCTION public.page_descendants(root_page_id TEXT)
RETURNS TABLE(id TEXT, depth INT)
AS $$
  WITH RECURSIVE tree AS (
    SELECT p.id, 1 AS depth, ARRAY[p.id] AS path
    FROM pages p
    WHERE p.parent_page_id = root_page_id AND p.is_deleted = FALSE
    UNION ALL
    SELECT p.id, t.depth + 1, t.path || p.id
    FROM pages p
    JOIN tree t ON p.parent_page_id = t.id
    WHERE p.is_deleted = FALSE
      AND t.depth < 50
      AND NOT p.id = ANY(t.path)
  )
  SELECT tree.id, tree.depth FROM tree;
$$ LANGUAGE sql STABLE;

-- ─── Ancestors ────────────────────────────────────────────
-- Returns ancestors of a page from root to parent (root first).
CREATE OR REPLACE FUNCTION public.page_ancestors(target_page_id TEXT)
RETURNS TABLE(id TEXT, title TEXT, depth INT)
AS $$
  WITH RECURSIVE chain AS (
    SELECT p.id, p.title, p.parent_page_id, 0 AS depth
    FROM pages p
    WHERE p.id = target_page_id
    UNION ALL
    SELECT p.id, p.title, p.parent_page_id, c.depth + 1
    FROM pages p
    JOIN chain c ON c.parent_page_id = p.id
    WHERE c.depth < 50
  )
  SELECT chain.id, chain.title, chain.depth
  FROM chain
  WHERE chain.id <> target_page_id
  ORDER BY chain.depth DESC;
$$ LANGUAGE sql STABLE;

-- ─── Depth check ──────────────────────────────────────────
-- Returns the depth of a page from root. Used to enforce max depth on insert/move.
CREATE OR REPLACE FUNCTION public.page_depth(target_page_id TEXT)
RETURNS INT
AS $$
  WITH RECURSIVE chain AS (
    SELECT p.id, p.parent_page_id, 0 AS depth
    FROM pages p
    WHERE p.id = target_page_id
    UNION ALL
    SELECT p.id, p.parent_page_id, c.depth + 1
    FROM pages p
    JOIN chain c ON c.parent_page_id = p.id
    WHERE c.depth < 50
  )
  SELECT MAX(depth) FROM chain;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.page_descendants(TEXT) IS 'Recursive: all descendant IDs + depth from a root page';
COMMENT ON FUNCTION public.page_ancestors(TEXT) IS 'Recursive: ancestor chain root→parent for a page';
COMMENT ON FUNCTION public.page_depth(TEXT) IS 'Returns depth of a page from tree root';

COMMIT;
