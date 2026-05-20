# Permissions System

> **Wave:** 01 | **Status:** Implemented

## نموذج الـ Permissions

الـ permission على أي page يُحسب من 3 مصادر بالترتيب (الأعلى specificity يكسب):

1. **User-level override** على الـ page أو أي ancestor
2. **Role-level override** أو `workspace_everyone`
3. **Workspace default** بناءً على دور العضو

## الـ Levels

| Level | يعني |
|-------|------|
| `none` | لا يرى الـ page |
| `view` | يقرأ فقط |
| `comment` | يقرأ + يعلّق (Wave 20) |
| `edit` | يقرأ + يكتب |
| `full` | كل شيء بما فيه التعديل على الـ permissions |

## Workspace Roles Default

| Role | Default Level |
|------|--------------|
| `owner` | `full` دائمًا — لا يمكن تخفيضه |
| `admin` | `full` |
| `member` | `edit` |
| `viewer` | `view` |

## Locked Pages

لو `is_locked = true` على الـ page:
- أي مستخدم عنده `edit` يتحوّل تلقائيًا لـ `view`
- `owner` و`admin` غير متأثرين

## قواعد إجبارية

- ممنوع تنزيل level لـ owner بأي override
- كل resolver call يمر على `resolvePageAccess` من `packages/permissions/src`
- ممنوع permission checks مبعثرة في الـ UI

## الـ API

```typescript
import { resolvePageAccess } from '@zenith/permissions'

const level = await resolvePageAccess({ userId, pageId })
// 'none' | 'view' | 'comment' | 'edit' | 'full'
```
