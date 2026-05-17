/**
 * Step 07.5 — Notification Rate Limit (client-side guard)
 * المرحلة 07: notification بدون rate limit = spam risk
 *
 * الـ DB-side bucket يُطبَّق عبر migration 0510 في Supabase.
 * هنا: client-side assertion + Supabase call.
 */
import { supabase } from "../auth/supabase";
import { logger } from "../logger";

export class NotificationRateLimitError extends Error {
  constructor(type: string, perHour: number) {
    super(`${type}: تجاوزت الحد المسموح ${perHour} إشعارات/ساعة`);
    this.name = "NotificationRateLimitError";
  }
}

/**
 * يتحقق من أن المستخدم لم يتجاوز حد الإشعارات لهذا النوع في الساعة الحالية.
 * يُستخدم قبل إرسال أي إشعار.
 */
export async function assertNotificationLimit(
  userId: string,
  type: string,
  perHour = 5
): Promise<void> {
  const hour = new Date();
  hour.setMinutes(0, 0, 0);
  const hourBucket = hour.toISOString();

  try {
    const { data } = await supabase
      .from("notification_buckets")
      .select("count")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("hour_bucket", hourBucket)
      .maybeSingle();

    if ((data?.count ?? 0) >= perHour) {
      throw new NotificationRateLimitError(type, perHour);
    }

    // زيادة العداد
    await supabase.rpc("increment_notification_bucket", {
      p_user: userId,
      p_type: type,
      p_hour: hourBucket,
    });
  } catch (err) {
    if (err instanceof NotificationRateLimitError) throw err;
    // لو فشل الـ check نفسه (table مش موجودة بعد)، نسجل ونكمل
    logger.warn({ err, userId, type }, "notification_rate_limit_check_failed");
  }
}

/** أنواع الإشعارات المعتمدة */
export const NOTIFICATION_TYPES = {
  MORNING_BRIEF: "morning_brief",
  EVENING_REVIEW: "evening_review",
  TASK_REMINDER: "task_reminder",
  HABIT_REMINDER: "habit_reminder",
  FOCUS_SESSION: "focus_session",
  SYSTEM: "system",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
