/**
 * @zenith/i18n — Internationalization
 *
 * Uses next-intl. Supports: ar, en.
 * RTL-first layout (Arabic primary).
 */

export const SUPPORTED_LOCALES = ['ar', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}
