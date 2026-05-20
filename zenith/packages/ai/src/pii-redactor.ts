/**
 * PII Redactor — strips personal data before any AI call.
 * ADR-0004: AI never receives vault plaintext or raw PII.
 */

const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  { name: 'email', pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  { name: 'phone', pattern: /(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, replacement: '[PHONE]' },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
  { name: 'card', pattern: /\b(?:\d[ -]?){13,19}\b/g, replacement: '[CARD]' },
  { name: 'national_id', pattern: /\b[0-9]{14}\b/g, replacement: '[NATIONAL_ID]' },
]

export function redactPII(text: string): { redacted: string; piiFound: string[] } {
  let redacted = text
  const piiFound: string[] = []

  for (const { name, pattern, replacement } of PII_PATTERNS) {
    const matches = text.match(pattern)
    if (matches?.length) {
      piiFound.push(`${name}(${matches.length})`)
      redacted = redacted.replace(pattern, replacement)
    }
  }

  return { redacted, piiFound }
}

export function assertNoVaultContent(text: string): void {
  const VAULT_MARKERS = ['[VAULT:', 'vault_item_id:', 'xchacha20:']
  for (const marker of VAULT_MARKERS) {
    if (text.includes(marker)) {
      throw new Error(`AI_VAULT_LEAK: vault content marker detected: ${marker}`)
    }
  }
}
