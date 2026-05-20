export const SECRET_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: 'openai_key',      pattern: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: 'anthropic_key',   pattern: /\bsk-ant-[A-Za-z0-9]{20,}\b/ },
  { name: 'jwt',             pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/ },
  { name: 'aws_key',         pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'stripe_secret',   pattern: /\bsk_(live|test)_[A-Za-z0-9]{20,}\b/ },
  { name: 'private_key_pem', pattern: /-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----/ },
  { name: 'env_secret_word', pattern: /\b(SECRET|PASSWORD|API[_-]?KEY|TOKEN)\s*[:=]\s*\S{8,}/i },
  { name: 'supabase_service_role', pattern: /\beyJ[A-Za-z0-9_-]+service_role[A-Za-z0-9_-]+\b/ },
];

export function scanForSecrets(text: string): string[] {
  return SECRET_PATTERNS.filter(p => p.pattern.test(text)).map(p => p.name);
}

export function assertNoSecrets(text: string): void {
  const found = scanForSecrets(text);
  if (found.length) throw new Error(`SECRET_DETECTED:${found.join(',')}`);
}
