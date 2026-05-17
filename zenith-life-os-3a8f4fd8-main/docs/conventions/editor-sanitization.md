# Editor Sanitization Convention — Wave 06

## Mandatory Rules
1. **DOMPurify server-side** on ALL content_json before DB insert — no exceptions.
2. `dangerouslySetInnerHTML` is FORBIDDEN without prior DOMPurify sanitization.
3. `eval`, `Function`, `new Function` are FORBIDDEN everywhere.

## Allowed HTML Tags (in paragraph/heading/etc.)
`b, i, u, s, strong, em, code, a, br`

## Allowed Attributes
`href, target, rel` (on `<a>` only — rel must include `noopener`)

## Blocked Content
- `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>` in content_json.
- `on*` event handlers (onclick, onerror, etc.).
- `javascript:` protocol in URLs.
- `data:` URIs except `data:image/*` with max 5MB.
- URLs outside CSP allowlist for embed/image/video blocks.

## Per-Block-Type Rules
| Block | Extra Rules |
|---|---|
| `code` | Rendered via `textContent` only — no innerHTML |
| `embed` | `isAllowedEmbedUrl()` check + sandbox iframe |
| `image` | src must match CSP img-src allowlist |
| `vault_inline` | Content encrypted — never rendered as HTML |

## Markdown Import
All imported markdown passes through `sanitizeBlockContent()` before block creation.
URLs in `[text](url)` are validated via `isAllowedEmbedUrl()`.
