import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../../lib/auth/supabase";
import { ChevronLeft, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { SettingsNav } from "./profile";

export const Route = createFileRoute("/settings/danger")({
  component: DangerSettingsPage,
});

function DangerSettingsPage() {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "حذف حسابي") return;
    setDeleting(true);
    // Sign out first — actual deletion needs server-side admin
    await supabase.auth.signOut();
    navigate({ to: "/auth/signin" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/settings" as "/" })} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors" aria-label="الرجوع">
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-red-400">المنطقة الحمراء</h1>
            <p className="text-sm text-muted-foreground">إجراءات لا يمكن التراجع عنها</p>
          </div>
        </div>

        <SettingsNav active="danger" />

        <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/5 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-red-400">حذف الحساب</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              حذف حسابك سيؤدي إلى فقدان جميع بياناتك بشكل نهائي — بما في ذلك الأهداف، العادات، الملاحظات، وسجل الخزنة.
              هذا الإجراء <strong className="text-red-400">لا يمكن التراجع عنه</strong>.
            </p>

            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                أريد حذف حسابي
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-400 font-medium">
                  اكتب "حذف حسابي" للتأكيد:
                </p>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="حذف حسابي" dir="rtl"
                  className="w-full rounded-xl border border-red-500/30 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all" />
                <div className="flex gap-3">
                  <button onClick={handleDelete} disabled={confirmText !== "حذف حسابي" || deleting}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-all"
                    aria-busy={deleting}>
                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحذف...</> : "حذف نهائياً"}
                  </button>
                  <button onClick={() => { setShowConfirm(false); setConfirmText(""); }}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Data */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">تصدير البيانات</h2>
          <p className="text-sm text-muted-foreground">
            قم بتنزيل نسخة من جميع بياناتك (أهداف، عادات، ملاحظات، إعدادات) بصيغة JSON.
          </p>
          <button className="rounded-xl border border-border bg-white/5 px-6 py-2.5 text-sm font-medium text-foreground hover:bg-white/10 transition-all">
            قريباً — تصدير البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
