# Page Tree System

> **Wave:** 01 | **Status:** Implemented

## البنية

الـ page tree هو single table `pages` مع self-referential `parent_page_id`.

```
Workspace Root
├── Page A (parent_page_id = NULL)
│   ├── Page B (parent_page_id = A.id)
│   └── Page C (parent_page_id = A.id)
└── Page D (parent_page_id = NULL)
    └── Page E (parent_page_id = D.id)
```

## القواعد

- `parent_page_id = NULL` → root page تحت الـ workspace مباشرة
- **عمق أقصى = 50 level** للحماية من recursion
- **ممنوع cycles** — يتحقق عند move
- الـ `position` عبارة عن `DOUBLE PRECISION` يسمح بإدراج بين عنصرين بدون re-index

## الـ Position Algorithm

```
newPosition = (prevSibling.position + nextSibling.position) / 2
// لو مفيش prev → position = nextSibling.position - 1000
// لو مفيش next → position = prevSibling.position + 1000
```

## DB Functions

```sql
-- Returns all descendants
SELECT id, depth FROM page_descendants(root_page_id);

-- Returns ancestors (root first)
SELECT id, title, depth FROM page_ancestors(target_page_id);
```

## Slug Rules

- Unique داخل نفس الـ workspace فقط
- Max 80 chars
- Generated تلقائيًا من الـ title
- Collision → suffix `-2`, `-3`, ...

## Archive vs Delete

- **Archive:** `is_archived = true` — الـ page مخفية بس موجودة
- **Soft delete:** `is_deleted = true, deleted_at = now()` — grace period قبل الـ hard delete
- كلاهما recursive على كل الـ subtree

## الـ Materialized Path (Fallback)

لو الـ recursive CTE تجاوز p95 50ms على subtree بـ 200 node:
- فعّل migration `0109__pages_path_cache.sql`
- `materialized_path TEXT[]` column + GIN index
- Trigger يحدّثها عند insert/move
