import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { User, Shield, Smartphone, AlertTriangle, Bell } from "lucide-react";
import { useAuth } from "../components/auth/AuthProvider";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Zenith — الإعدادات" }] }),
  component: SettingsIndex,
});

function SettingsIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const sections = [
    { key: "profile", label: "الملف الشخصي", desc: "الاسم، اللغة، المنطقة الزمنية", icon: User, href: "/settings/profile" },
    { key: "notifications", label: "الإشعارات", desc: "أوقات الإشعارات وتفضيلاتها (Max 5/ساعة)", icon: Bell, href: "/settings/notifications" },
    { key: "privacy", label: "الخصوصية", desc: "بيانات الاستخدام، الذكاء الاصطناعي، الخزنة", icon: Shield, href: "/settings/privacy" },
    { key: "security", label: "الأمان", desc: "كلمة المرور، المصادقة الثنائية", icon: Shield, href: "/settings/security" },
    { key: "devices", label: "الأجهزة المتصلة", desc: "الجلسات النشطة وإدارتها", icon: Smartphone, href: "/settings/devices" },
    { key: "danger", label: "المنطقة الحمراء", desc: "حذف الحساب، تصدير البيانات", icon: AlertTriangle, href: "/settings/danger" },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <a key={section.key} href={section.href}
            className="flex items-center gap-4 rounded-2xl glass p-5 hover:bg-white/5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.key === "danger" ? "bg-red-500/10" : "bg-accent/10"}`}>
              <section.icon className={`w-5 h-5 ${section.key === "danger" ? "text-red-400" : "text-accent"}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${section.key === "danger" ? "text-red-400" : "text-foreground"}`}>{section.label}</p>
              <p className="text-xs text-muted-foreground">{section.desc}</p>
            </div>
            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
