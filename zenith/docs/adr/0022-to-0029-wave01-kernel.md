# ADR-0022 to ADR-0029 — Wave 01 Kernel Decisions

> الملف ده بيجمع الـ ADRs المتعلقة بـ Wave 01 (Workspace + Profile + Page Kernel).

---

## ADR-0022 — Supabase Auth as Source of Truth

**Status:** Accepted

**Context:**
نحتاج identity provider موثوق يدير الـ sessions والـ JWT والـ OAuth. بناء auth من الصفر هو risk غير مبرر.

**Decision:**
نستخدم Supabase Auth كـ source of truth للهوية. الـ `auth.users.id` (UUID) يتـ mirror في `public.users.id` كـ TEXT. هذا استثناء موثّق على قاعدة ULID العامة.

**Consequences:**
- ✅ مجاني، production-ready، يدعم OAuth/MFA
- ✅ Row-level security يعتمد على `auth.uid()`
- ⚠️ IDs في `public.users` هي UUIDs مش ULIDs — لكن باقي الجداول تلتزم بـ ULID

---

## ADR-0023 — Page Tree: Single Table + Recursive CTE

**Status:** Accepted

**Context:**
نحتاج hierarchical content tree مع support للـ move، archive، وrecursive operations.

**Decision:**
نستخدم single table `pages` مع `parent_page_id` self-referential FK. الـ recursive CTEs (`page_descendants` و`page_ancestors`) للـ queries. Materialized path كـ fallback اختياري لو الـ CTE تعدّى p95 50ms.

**Consequences:**
- ✅ Simple schema, easy to understand
- ✅ Postgres native, no extra libraries
- ⚠️ Deep trees (>50 levels) ممنوعة بشكل صريح لحماية الـ recursion

---

## ADR-0024 — Additive Permission Overrides

**Status:** Accepted

**Context:**
نحتاج نظام permissions مرن يسمح بـ override على مستوى الـ page بدون تعقيد.

**Decision:**
الـ permission يُحسب بالترتيب:
1. User-level override على الـ page أو ancestor
2. Role-level override
3. workspace_everyone override
4. Workspace default role

الـ highest specific override wins. لا يوجد deny explicit — النظام additive فقط.

**Consequences:**
- ✅ Simple mental model
- ✅ No permission conflicts
- ⚠️ لا يمكن منع مستخدم معين من رؤية page ما لم تُعطَ له override صريح

---

## ADR-0025 — Global-Unique Workspace Slugs

**Status:** Accepted

**Context:**
الـ workspace slug يظهر في الـ URL (`app.zenith.com/{slug}`). نحتاج uniqueness.

**Decision:**
الـ slug unique على مستوى الـ database كله (مش per-tenant). تغيير الـ slug rate-limited بمرة كل 30 يوم. Slugs محجوزة: `api, app, admin, auth, signin, signup, settings, help, docs, pricing, about, blog, legal, terms, privacy, status, invite`.

**Consequences:**
- ✅ Clean URLs بدون tenant prefix في الـ URL
- ⚠️ شركتان بنفس الاسم → collision → يضاف suffix رقمي تلقائياً

---

## ADR-0026 — Invitations: Email + Token + 14-Day Expiry

**Status:** Accepted

**Context:**
نحتاج secure invitation system يمنع impersonation و token reuse.

**Decision:**
- Token: 32-byte random URL-safe base64 (stored as `token TEXT UNIQUE`)
- Expiry: 14 days
- Email binding: الـ accept يتحقق من `invited_email == current_user_email` (case-insensitive)
- One-time: token يُستخدم مرة واحدة فقط
- Audit: كل accept/revoke/decline له audit event

**Consequences:**
- ✅ Secure against token theft (email binding)
- ✅ No plaintext in audit logs
- ⚠️ اللي عنده email مختلف مش يقدر يقبل الدعوة (عمدًا)

---

## ADR-0027 — Outbound Emails Stub in Wave 01

**Status:** Accepted

**Context:**
نحتاج إرسال invitation emails لكن الـ email provider setup جزء من Wave 12 (Billing/Notifications).

**Decision:**
Wave 01 بتعمل `outbound_emails` queue table وتـ enqueue الإيميلات. الـ actual sending بيتأجّل للـ Wave 12. Workers الـ Wave 01 مش بتبعت إيميلات حقيقية.

**Consequences:**
- ✅ لا نكسر الـ kernel scope بـ email provider setup
- ✅ Schema جاهز وmigrated
- ⚠️ مش هيوصل إيميلات في الـ development phase الأولى

---

## ADR-0028 — Page Slug Unique Per Workspace

**Status:** Accepted

**Context:**
الـ page slug يظهر في الـ URL داخل الـ workspace: `/{workspaceSlug}/p/{pageSlug}`.

**Decision:**
الـ page slug unique داخل نفس الـ workspace فقط (`UNIQUE (workspace_id, slug)`). Max 80 chars. Auto-generated من الـ title، collision يضيف suffix.

**Consequences:**
- ✅ مش محتاجين global uniqueness
- ✅ نفس الـ slug ممكن يتكرر في workspaces مختلفة

---

## ADR-0029 — Last Owner Cannot Be Removed

**Status:** Accepted

**Context:**
لو آخر owner اتشال أو حوّل نفسه لـ member، الـ workspace ما عندهاش owner — undefined state.

**Decision:**
- ممنوع remove الـ owner الأخير من الـ workspace
- ممنوع change role لـ owner إلا عبر `transfer-ownership` flow
- `transfer-ownership` يحوّل الـ owner الحالي لـ `admin` تلقائيًا
- لو 0 owners + 0 admins بعد 90d بدون activity → workspace تدخل `dormant` state

**Consequences:**
- ✅ لا يوجد workspace orphaned أبدًا
- ✅ Ownership transfer واضح وموثّق
