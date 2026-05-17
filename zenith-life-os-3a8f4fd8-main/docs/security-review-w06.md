# Wave 06 — Security Review Report

**Date:** 2026-05-17  
**Reviewer:** Antigravity (Automated + Manual)  
**Status:** ✅ PASSED — All critical checks green

---

## U1. XSS Review — All Block Types

| Block Type | Risk Vector | Mitigation | Status |
|---|---|---|---|
| `paragraph` | HTML in text | DOMPurify (allowed: b,i,u,s,code,a,br) | ✅ |
| `heading_1/2/3` | HTML in text | DOMPurify | ✅ |
| `bulleted_list` | HTML in items | DOMPurify per item | ✅ |
| `numbered_list` | HTML in items | DOMPurify per item | ✅ |
| `todo` | HTML in text | DOMPurify | ✅ |
| `quote` | HTML in text | DOMPurify | ✅ |
| `callout` | HTML in text + icon | DOMPurify + icon allowlist | ✅ |
| `code` | Raw code | Escaped via `textContent` (no innerHTML) | ✅ |
| `image` | src URL | `isAllowedEmbedUrl()` + CSP | ✅ |
| `video` | src URL | sandbox iframe + CSP | ✅ |
| `audio` | src URL | CSP audio-src allowlist | ✅ |
| `embed` | iframe src | `isAllowedEmbedUrl()` + `sandbox="..."` | ✅ |
| `bookmark` | URL preview | URL validation + no innerHTML | ✅ |
| `synced_block` | source_block_id | UUID validation | ✅ |
| `database_inline` | placeholder | No content rendered (stub) | ✅ |
| `template_button` | label + icon | DOMPurify on label | ✅ |
| `page_link` | page slug | UUID/slug validation | ✅ |
| `table_of_contents` | auto-generated | Read from headings (sanitized source) | ✅ |

## U2. Embed iframe Sandbox Attributes

```html
<!-- Required sandbox on all embed iframes -->
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  referrerpolicy="no-referrer"
  loading="lazy"
  title="..."
/>
```

**Blocked by sandbox:**
- ❌ `allow-top-navigation` (no redirect hijack)
- ❌ `allow-modals` (no alert/confirm)
- ❌ `allow-downloads` (no silent downloads)
- ❌ `allow-pointer-lock`
- ❌ `allow-presentation`

**Status:** ✅ Enforced in `BlockRenderer.tsx` for `embed` and `video` blocks

## U3. Image/Video Source Validation

```typescript
const ALLOWED_EMBED_HOSTS = [
  'youtube.com', 'youtu.be',
  'vimeo.com', 'player.vimeo.com',
  'loom.com', 'useloom.com',
  'figma.com',
  'codepen.io',
  'codesandbox.io',
  'twitter.com', 'x.com',
  'github.com',
];
```

- All `src` values validated via `isAllowedEmbedUrl()`
- `javascript:` protocol rejected
- `data:` protocol rejected (except `data:image/*` for base64 images with max 5MB)
- `file:` protocol rejected

**Status:** ✅ Implemented in `sanitizer.ts`

## U4. Markdown Import Sanitizer

- All imported markdown text passes through `sanitizeBlockContent()` before creating blocks
- `<script>`, `<iframe>`, `<style>`, `<link>`, event handlers all stripped
- URLs in `[text](url)` validated via `isAllowedEmbedUrl()`
- Code blocks: content stored as raw text, rendered via `textContent` (no innerHTML)

**Status:** ✅ Implemented in `markdown-import.ts`

## U5. Outbox — No Secrets Stored

Rules enforced in `use-block-mutation.ts` outbox queue:

- `content_json` is stored in outbox — must be sanitized first (✅ sanitized before queue)
- `userId` is stored (acceptable — not a secret)
- No auth tokens stored in outbox
- No vault block content queued (vault blocks excluded from optimistic mutations)
- Max 200 entries (prevents localStorage exhaustion)
- Entries older than 7 days auto-pruned on next read

**Status:** ✅ Safe

## U6. SQL Injection

- All DB access via Supabase SDK (parameterized queries)
- No raw SQL in route handlers
- No string interpolation in SQL
- RPC functions use `$1, $2` placeholders

**Status:** ✅ Zero SQL injection vectors

## U7. Vault Block AI Context Guard

```typescript
// In sanitizer.ts
export function assertNoVaultBlockInAIContext(blocks: Block[]): void {
  const vaultBlocks = blocks.filter(
    (b) => b.content_json?.is_vault === true || b.content_json?.vault === true
  );
  if (vaultBlocks.length > 0) {
    throw new Error(
      `VAULT_BLOCK_IN_AI_CONTEXT: ${vaultBlocks.length} vault block(s) detected`
    );
  }
}
```

**Status:** ✅ Enforced — throws before any AI call with vault content

---

## Summary

| Category | Issues Found | Status |
|---|---|---|
| XSS (all block types) | 0 | ✅ |
| iframe sandbox | 0 | ✅ |
| URL validation | 0 | ✅ |
| Markdown sanitizer | 0 | ✅ |
| Outbox secrets | 0 | ✅ |
| SQL injection | 0 | ✅ |
| Vault→AI leaks | 0 | ✅ |

**Verdict: Wave 06 Security Review PASSED ✅**
