/**
 * Money — Cents-based monetary arithmetic.
 * Phase 01: INV-12 mandates *_cents BIGINT for all monetary values.
 *
 * RULES:
 * - All money stored as integer cents (no decimals ever)
 * - parseFloat/toFixed are BANNED for money
 * - Display only via Intl.NumberFormat
 */

// ─── Branded Type ──────────────────────────────────────
export type Cents = number & { readonly __brand: 'Cents' }

export interface Money {
  readonly amount: Cents
  readonly currency: string // ISO 4217 (e.g., "EGP", "USD")
}

/**
 * Create a Cents value from an integer.
 * Rejects NaN, Infinity, and fractional values.
 */
export function cents(value: number): Cents {
  if (!Number.isFinite(value)) {
    throw new Error(`INVALID_MONEY: ${value} is not a finite number`)
  }
  if (!Number.isInteger(value)) {
    throw new Error(`INVALID_MONEY: ${value} is not an integer — use cents, not units`)
  }
  return value as Cents
}

/**
 * Create a Money object.
 */
export function money(amountCents: number, currency: string): Money {
  return {
    amount: cents(amountCents),
    currency: currency.toUpperCase(),
  }
}

/**
 * Add two Cents values safely.
 */
export function addCents(a: Cents, b: Cents): Cents {
  return cents(a + b)
}

/**
 * Subtract two Cents values safely.
 */
export function subtractCents(a: Cents, b: Cents): Cents {
  return cents(a - b)
}

/**
 * Format money for display using Intl.NumberFormat.
 * NEVER use toFixed() or parseFloat() for money display.
 */
export function formatMoney(m: Money, locale = 'ar-EG'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(m.amount / 100)
}

/**
 * Check if a column name follows the *_cents convention.
 */
export function isValidMoneyColumnName(name: string): boolean {
  return name.endsWith('_cents')
}
