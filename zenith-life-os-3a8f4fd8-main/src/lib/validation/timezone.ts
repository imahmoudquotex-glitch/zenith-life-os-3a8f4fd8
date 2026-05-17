/**
 * Step 07.1 — IANA Timezone Validator (Phase 07 requirement)
 * ❌ Anti-pattern: timezone بدون IANA validation
 * ✅ Pattern: Intl.DateTimeFormat يرفض الـ timezone الغير صالح
 */
export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export class ValidationError extends Error {
  public readonly fields: Record<string, string[]>;
  constructor(fields: Record<string, string[]>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export function assertTimezone(tz: string): void {
  if (!isValidIanaTimezone(tz)) {
    throw new ValidationError({ timezone: ["منطقة زمنية غير صالحة — يجب أن تكون IANA timezone"] });
  }
}

/** قائمة المناطق الزمنية المدعومة في الواجهة */
export const SUPPORTED_TIMEZONES = [
  { value: "Africa/Cairo", label: "مصر — القاهرة (UTC+2/+3)" },
  { value: "Asia/Riyadh", label: "السعودية — الرياض (UTC+3)" },
  { value: "Asia/Dubai", label: "الإمارات — دبي (UTC+4)" },
  { value: "Asia/Kuwait", label: "الكويت (UTC+3)" },
  { value: "Asia/Baghdad", label: "العراق — بغداد (UTC+3)" },
  { value: "Africa/Tunis", label: "تونس (UTC+1)" },
  { value: "Africa/Casablanca", label: "المغرب — الدار البيضاء (UTC+1)" },
  { value: "Europe/London", label: "لندن (UTC+0/+1)" },
  { value: "Europe/Paris", label: "باريس (UTC+1/+2)" },
  { value: "America/New_York", label: "نيويورك (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "لوس أنجلوس (UTC-8/-7)" },
  { value: "Asia/Tokyo", label: "طوكيو (UTC+9)" },
  { value: "Asia/Kolkata", label: "الهند (UTC+5:30)" },
  { value: "UTC", label: "UTC" },
] as const;
