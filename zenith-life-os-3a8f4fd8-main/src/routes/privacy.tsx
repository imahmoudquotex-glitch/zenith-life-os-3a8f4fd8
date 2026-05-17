import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">سياسة الخصوصية</h1>
          <p className="text-sm text-muted-foreground">آخر تحديث: مايو 2026</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. مقدمة</h2>
            <p>
              Zenith Life OS يحترم خصوصيتك ويلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. البيانات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-1 ps-4">
              <li>بيانات الحساب: البريد الإلكتروني، الاسم المعروض.</li>
              <li>بيانات الاستخدام: الأهداف، العادات، الملاحظات التي تضيفها.</li>
              <li>بيانات تقنية: عنوان IP (البلد فقط)، نوع المتصفح، المنطقة الزمنية.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. كيف نستخدم بياناتك</h2>
            <p>
              نستخدم بياناتك فقط لتوفير خدمة Zenith وتحسينها. لا نبيع بياناتك أبداً لأطراف ثالثة. لا نستخدم
              tracking pixels في رسائل البريد الإلكتروني بدون موافقتك.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. تشفير البيانات</h2>
            <p>
              جميع البيانات الحساسة مشفرة أثناء النقل (TLS 1.3) وأثناء التخزين. الخزنة (Vault) تستخدم
              تشفير صفري المعرفة (Zero-Knowledge Encryption) — نحن لا نستطيع قراءة محتوياتها.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. حقوقك</h2>
            <ul className="list-disc list-inside space-y-1 ps-4">
              <li>الوصول لبياناتك وتصديرها في أي وقت.</li>
              <li>طلب حذف حسابك وجميع بياناتك نهائياً.</li>
              <li>تعديل إعدادات الخصوصية من صفحة الإعدادات.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. التواصل</h2>
            <p>
              لأي استفسارات حول الخصوصية، تواصل معنا على:{" "}
              <a href="mailto:privacy@zenith.app" className="text-accent hover:underline">
                privacy@zenith.app
              </a>
            </p>
          </section>
        </div>

        <div className="text-center">
          <a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← العودة للوحة التحكم
          </a>
        </div>
      </div>
    </div>
  );
}
