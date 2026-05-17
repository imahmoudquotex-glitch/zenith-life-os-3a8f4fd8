/**
 * Step 07.4 — Settings Service (Safe Update Action)
 * المرحلة 07: Settings updates تتم عبر deep merge فقط
 *
 * القواعد:
 * - ❌ ممنوع replace JSON كاملاً
 * - ❌ ممنوع allowVaultContext = true من client
 * - ✅ deepMerge لكل update
 * - ✅ IANA timezone validation
 * - ✅ allowVaultContext يُجبر على false دائماً (DB trigger safety net أيضاً)
 */
import { supabase } from "../auth/supabase";
import { deepMerge } from "../utils/deep-merge";
import { assertTimezone } from "../validation/timezone";
import { logger } from "../logger";

export interface PrivacySettingsPatch {
  notifications?: {
    morningBriefAt?: string; // "HH:MM"
    eveningReviewAt?: string; // "HH:MM"
    enable?: Record<string, boolean>;
  };
  privacy?: {
    analyticsOptOut?: boolean;
  };
  ai?: {
    responseLanguage?: "ar" | "en";
    // ❌ allowVaultContext مش مسموح من هنا — الـ DB trigger + app يمنعه
  };
  timezone?: string;
  locale?: "ar" | "en";
}

export interface SettingsUpdateResult {
  success: boolean;
  error?: string;
}

/**
 * يحدّث إعدادات المستخدم بـ deep merge (لا replace).
 * يُستخدم في جميع صفحات الإعدادات.
 */
export async function updateUserSettings(
  userId: string,
  patch: PrivacySettingsPatch
): Promise<SettingsUpdateResult> {
  try {
    // التحقق من timezone لو موجود
    if (patch.timezone) {
      assertTimezone(patch.timezone);
    }

    // جلب الـ settings الحالية من user_metadata
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "المستخدم غير مسجل الدخول" };
    }

    const currentSettings = user.user_metadata?.settings ?? {};
    const currentTimezone = user.user_metadata?.timezone ?? "Africa/Cairo";
    const currentLocale = user.user_metadata?.locale ?? "ar";

    // Deep merge — لا replace
    const merged = deepMerge(currentSettings as Record<string, unknown>, {
      ...(patch.notifications && { notifications: patch.notifications }),
      ...(patch.privacy && { privacy: patch.privacy }),
      ...(patch.ai && { ai: patch.ai }),
    });

    // 🔒 إجباري: allowVaultContext يظل false دائماً
    if (merged.ai && typeof merged.ai === "object") {
      (merged.ai as Record<string, unknown>).allowVaultContext = false;
    }

    // تحديث user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        settings: merged,
        ...(patch.timezone ? { timezone: patch.timezone } : { timezone: currentTimezone }),
        ...(patch.locale ? { locale: patch.locale } : { locale: currentLocale }),
      },
    });

    if (updateError) {
      logger.warn({ err: updateError, userId }, "settings_update_failed");
      return { success: false, error: updateError.message };
    }

    logger.warn({ userId, keys: Object.keys(patch) }, "settings_updated");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطأ غير متوقع";
    logger.warn({ err, userId }, "settings_update_error");
    return { success: false, error: message };
  }
}

/**
 * يتحقق من أن أي patch لا يحاول تفعيل allowVaultContext
 * يُستخدم كـ guard قبل أي settings update
 */
export function assertNoVaultContextPatch(patch: unknown): void {
  const str = JSON.stringify(patch ?? {});
  if (str.includes("allowVaultContext")) {
    throw new Error("VAULT_CONTEXT_FORBIDDEN: Vault context cannot be enabled from client");
  }
}
