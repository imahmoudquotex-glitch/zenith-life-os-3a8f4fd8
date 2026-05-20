# Workspace Context Middleware

> **Wave:** 01 | **Status:** Implemented

## الغرض

قبل أي Postgres query في الـ app، لازم نـ set:

```sql
SELECT set_config('app.current_user_id', '<auth_user_id>', true);
SELECT set_config('app.current_workspace_id', '<workspace_ulid>', true);
```

هذا يُفعّل RLS policies التي تعتمد على `current_workspace_id()` و`current_user_id()`.

**لو نسيت ده → كل query على tenant tables يرجع 0 rows.**

## الاستخدام

```typescript
import { withWorkspaceContext } from '@zenith/auth'

const result = await withWorkspaceContext(
  { userId, workspaceId },
  async (db) => {
    // كل queries هنا محمية بـ RLS
    return db.query('SELECT * FROM pages WHERE ...')
  }
)
```

## Pattern في كل Route

```typescript
export const POST = withEnvelope(async ({ request }) => {
  const session = await requireUser(request)
  const workspaceId = request.headers.get('X-Workspace-Id')!
  await requireMembership(session.userId, workspaceId)

  return withWorkspaceContext({ userId: session.userId, workspaceId }, async (db) => {
    // business logic هنا
  })
})
```

## قواعد إجبارية

1. **لا query على tenant tables خارج `withWorkspaceContext`**
2. **Workspace context يتحقق server-side** من الـ membership — لا يُؤخذ من الـ client فقط
3. **`SET LOCAL` تلقائيًا** ينتهي عند `COMMIT` — لا residual settings بين requests
4. لو `withWorkspaceContext` فشل (user مش member) → `WORKSPACE_FORBIDDEN` error
