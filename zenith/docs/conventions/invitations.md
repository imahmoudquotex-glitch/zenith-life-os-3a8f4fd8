# Invitations System

> **Wave:** 01 | **Status:** Implemented

## الـ Flow

```
Admin/Owner يدخل email + role
         ↓
POST /api/v1/workspaces/:id/invitations
         ↓
Service يولّد token 32-byte + يكتب row في workspace_invitations
         ↓
Email يتـ enqueue في outbound_emails (actual send Wave 12)
         ↓
Invitee يفتح link: /invite/{token}
         ↓
لو مش logged in → redirect لـ /signup?invite={token}
         ↓
بعد login → POST /api/v1/invitations/:token/accept
         ↓
Service يتحقق: pending + not expired + email match
         ↓
INSERT في users_workspaces + UPDATE status = 'accepted'
         ↓
Audit event: workspace.member.joined
```

## قواعد الأمان

- **Token:** 32-byte URL-safe base64 — one-time use فقط
- **Expiry:** 14 يوم من الإرسال
- **Email binding:** `invited_email == current_user_email` (case-insensitive) — إجباري
- **Error messages:** لا تكشف وجود email أو workspace
- **Self-invitation:** ممنوع
- **Rate limiting:** 10 invitations/hour per user، 50/day، 100/day per workspace

## Status Machine

```
pending → accepted (Invitee accepts)
pending → declined (Invitee declines)
pending → revoked  (Admin/Owner revokes)
pending → expired  (Cron job بعد 14d)
```

## Error Codes

| Code | السبب |
|------|-------|
| `INVITATION_INVALID` | Token مش موجود أو expired |
| `INVITATION_EXPIRED` | الـ 14 يوم انتهوا |
| `INVITATION_EMAIL_MISMATCH` | Email الـ invitee مختلف |
| `INVITATION_ALREADY_ACCEPTED` | Token استُخدم قبل كده |
| `INVITATION_RECIPIENT_FLOODED` | الـ email عنده أكتر من 3 invitations active |
