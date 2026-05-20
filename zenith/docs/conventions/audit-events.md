# Audit Events

> **Wave:** 00/01 | **Status:** Implemented

## المبدأ

كل mutation في الـ system لازم تولّد audit event. الـ audit log:
- **Append-only** — ممنوع UPDATE أو DELETE
- **بدون plaintext** — passwords/tokens/vault content ممنوعة
- يحتوي `before_hash` و`after_hash` للـ tamper detection

## الـ Schema

```typescript
interface AuditEvent {
  id: Ulid
  workspaceId: string
  actor: { type: 'user' | 'system' | 'admin'; id?: string }
  action: string           // مثال: 'workspace.created'
  resourceType: string     // مثال: 'workspace'
  resourceId: string
  before?: Record<string, unknown>   // state قبل التغيير
  after?: Record<string, unknown>    // state بعد التغيير
  ip?: string              // hashed للـ GDPR
  userAgent?: string
  createdAt: Date
}
```

## Kernel Actions (Wave 01)

| Action | يحدث عند |
|--------|-----------|
| `workspace.created` | إنشاء workspace |
| `workspace.updated` | تعديل settings |
| `workspace.archived` | archive workspace |
| `workspace.restored` | restore workspace |
| `workspace.ownership_transferred` | تحويل الـ ownership |
| `workspace.member.invited` | إرسال دعوة |
| `workspace.member.joined` | قبول دعوة |
| `workspace.member.declined` | رفض دعوة |
| `workspace.member.revoked` | revoke دعوة |
| `workspace.member.removed` | إزالة عضو |
| `workspace.member.role_changed` | تغيير role |
| `page.created` | إنشاء page |
| `page.updated` | تعديل page |
| `page.moved` | نقل page |
| `page.archived` | archive page |
| `page.restored` | restore page |
| `page.deleted` | soft delete page |
| `page.permission.set` | تعديل page permission |
| `user.profile.updated` | تعديل profile |

## القواعد

1. **كل service** لازم يستدعي `auditWriter.write(...)` في كل mutation
2. `scripts/check-audit-events.ts` يتحقق CI إن كل mutations فيها audit
3. ممنوع تسجيل passwords أو tokens أو vault content في `before`/`after`
4. الـ `before`/`after` يحتويان JSON المنظّف فقط

## الاستخدام

```typescript
import { auditWriter } from '@zenith/audit'

await auditWriter.write({
  workspaceId,
  actor: { type: 'user', id: userId },
  action: 'workspace.created',
  resourceType: 'workspace',
  resourceId: wsId,
  after: { slug, name, plan },
})
```
