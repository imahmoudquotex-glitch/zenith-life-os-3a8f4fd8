import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div>
            <span className="text-grad-green text-5xl font-black tracking-tight">Z</span>
            <span className="text-5xl font-black text-foreground tracking-tight">enith</span>
          </div>
          <p className="text-lg text-muted-foreground">نظام تشغيل حياتك الشخصي</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">الرؤية</h2>
            <p>
              Zenith هو نظام تشغيل شخصي مصمم ليكون غرفة التحكم في حياتك. نؤمن أن كل شخص يستحق
              أداة واحدة متكاملة تجمع أهدافه، عاداته، ملاحظاته، وتحليلاته في مكان واحد — بخصوصية
              تامة وتشفير صفري المعرفة.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">المبادئ</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: "🔒", title: "الخصوصية أولاً", desc: "تشفير صفري المعرفة. بياناتك لا نقرأها." },
                { icon: "🌙", title: "مظلم دائماً", desc: "تصميم مظلم حصري لراحة عينيك." },
                { icon: "🌍", title: "عربي أولاً", desc: "واجهة عربية كاملة مع دعم RTL." },
                { icon: "💚", title: "مجاني للجميع", desc: "نموذج تبرعات فقط. لا ميزات مقفلة." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-white/5 p-4 space-y-1">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">التقنيات</h2>
            <p>
              بُني Zenith بأحدث التقنيات: React + TanStack Router + Supabase + Tailwind CSS v4.
              تطبيق ويب تقدمي (PWA) يعمل على أي جهاز — بدون تثبيت من متجر التطبيقات.
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
