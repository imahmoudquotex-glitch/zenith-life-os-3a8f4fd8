# Zenith Life OS — Glossary (Wave 06+)

## Block Editor Terms

| Term | Definition |
|---|---|
| **Block** | أصغر وحدة محتوى في المحرر. كل بلوك له نوع (type) ومحتوى (content_json) وموضع (position). |
| **Fractional Index** | نظام ترتيب يستخدم أرقام عشرية بدل أعداد صحيحة، يتيح الإدراج بين عنصرين بدون إعادة ترتيب الكل. |
| **Synced Block** | بلوك يعكس محتوى بلوك آخر (source). أي تعديل على المصدر ينعكس على كل النسخ. |
| **ProseMirror** | مكتبة JavaScript لبناء محررات نصوص منظمة (rich text) قابلة للتوسع. |
| **TipTap** | Wrapper حول ProseMirror يوفر extensions وتجربة مطور أسهل. يُستخدم في Wave 06. |
| **Slash Menu** | قائمة تظهر عند كتابة `/` في بداية بلوك، تتيح اختيار نوع البلوك الجديد. |
| **Virtual Scroll** | تقنية تُظهر فقط البلوكات المرئية في الشاشة، وتُخفي الباقي من DOM لتحسين الأداء عند وجود 200+ بلوك. |
| **Outbox** | قائمة انتظار في IndexedDB تحفظ الـ mutations عند انقطاع الاتصال وتُرسلها تلقائياً عند العودة. |
| **Idempotency-Key** | معرف فريد (UUID) يُرسل مع كل mutation ليمنع تكرار تنفيذ نفس العملية. |
| **Optimistic UI** | تقنية تُحدّث الواجهة فورًا قبل تأكيد السيرفر، مع rollback عند الفشل. |
| **ULID** | Universally Unique Lexicographically Sortable Identifier. يُستخدم كـ block IDs. |
| **RLS** | Row Level Security — سياسة حماية صفوف قاعدة البيانات على مستوى Workspace. |
| **FORCE RLS** | يُجبر RLS حتى على owner الجدول — لا استثناءات. |
| **Vault Block** | نوع بلوك خاص (`vault_inline`) محتواه مشفر ZKE ولا يدخل AI context أبداً. |
| **ADR** | Architecture Decision Record — وثيقة تُسجّل قرار معماري وسببه وبدائله. |
| **Soft Delete** | حذف منطقي: `is_deleted = true` بدون حذف فعلي من DB. يتيح الاسترجاع. |
| **Cycle Detection** | خوارزمية DFS لاكتشاف الحلقات في مراجع synced blocks (A→B→A = مرفوض). |
| **DOMPurify** | مكتبة لتنقية HTML من XSS attacks. مطلوبة server-side على كل content_json. |
| **W06-frozen** | علامة تدل على اكتمال Wave 06 وجاهزيتها للإنتاج. |
| **Signed URL** | رابط مؤقت موقّع يُتيح رفع/تنزيل ملف مباشرة من/إلى Supabase Storage. |
| **MIME Whitelist** | قائمة أنواع الملفات المسموح بها فقط عند الرفع (images, videos, audio, PDF, etc.). |
| **Workspace Quota** | الحد الأقصى للتخزين لكل Workspace (5 GB افتراضيًا). |

## Formula Engine Terms (Wave 08)

| Term | Definition |
|---|---|
| **AST (Abstract Syntax Tree)** | هيكل شجري يمثل بنية الكود البرمجي. في محرك الصيغ، يتم تحليل النص إلى AST لضمان الأمان والتحقق من الأنواع قبل التنفيذ. |
| **Type Checker** | نظام تحقق من الأنواع الثابتة يعمل في مرحلة الـ Parse لضمان صحة القيم المدخلة للدوال (مثلاً يمنع جمع نص مع رقم). |
| **Recalc Queue** | طابور (Queue) يعمل في الخلفية لمعالجة إعادة الحسابات (Recalculation) للصيغ التي تعتمد على بيانات تم تحديثها، لضمان عدم حظر الخادم. |
| **Formula Cache** | جدول `formula_cache` يخزن النتائج المحسوبة مسبقًا مع مؤشر `is_stale` لتسريع عمليات الاستعلام والقراءة. |

## Performance Targets (Wave 06)

| Metric | Target |
|---|---|
| Keystroke p99 | < 16ms |
| Slash menu open | < 100ms |
| Page load (100 blocks) | < 500ms |
| Page load (1000 blocks, virtual) | < 1500ms |
| Drag-drop visual feedback | < 50ms |
| Mutation save (online) p95 | < 300ms |
| Mutation enqueue (offline) | < 5ms |
