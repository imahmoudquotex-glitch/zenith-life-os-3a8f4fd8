import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">شروط الاستخدام</h1>
          <p className="text-sm text-muted-foreground">آخر تحديث: مايو 2026</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">1. قبول الشروط</h2>
            <p>
              باستخدامك لتطبيق Zenith Life OS، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام التطبيق.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">2. وصف الخدمة</h2>
            <p>
              Zenith هو نظام تشغيل للحياة يساعدك في إدارة أهدافك، عاداتك، ملاحظاتك، ومهامك اليومية.
              التطبيق يعمل كتطبيق ويب تقدمي (PWA) مع وضع مظلم حصري.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">3. حسابك</h2>
            <ul className="list-disc list-inside space-y-1 ps-4">
              <li>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</li>
              <li>يجب ألا يقل عمرك عن 16 عاماً لاستخدام الخدمة.</li>
              <li>حساب واحد لكل شخص. ممنوع مشاركة الحسابات.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">4. الاستخدام المقبول</h2>
            <p>
              لا يجوز استخدام Zenith في أي أنشطة غير قانونية، أو محاولة الوصول غير المصرح به للنظام،
              أو إساءة استخدام خوادمنا أو أنظمة الأمان.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">5. ملكية المحتوى</h2>
            <p>
              أنت تحتفظ بملكية جميع البيانات التي تضيفها إلى Zenith. نحن لا نستخدم محتواك
              لتدريب نماذج ذكاء اصطناعي أو لأي غرض آخر غير تقديم الخدمة لك.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">6. نموذج التبرعات</h2>
            <p>
              Zenith يعمل بنموذج التبرعات فقط (Donations-only). لا توجد اشتراكات إجبارية أو ميزات
              مقفلة خلف دفع. التبرع اختياري بالكامل لدعم تطوير المشروع.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">7. التواصل</h2>
            <p>
              لأي استفسارات حول الشروط:{" "}
              <a href="mailto:legal@zenith.app" className="text-accent hover:underline">
                legal@zenith.app
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
