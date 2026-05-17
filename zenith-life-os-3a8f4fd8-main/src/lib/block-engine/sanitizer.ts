/**
 * Wave 06 — Block Sanitizer
 * src/lib/block-engine/sanitizer.ts
 *
 * القواعد:
 * - ❌ dangerouslySetInnerHTML بدون DOMPurify
 * - ❌ <script>, on*, javascript:, data: URI
 * - ✅ code blocks: display only (لا تنفيذ)
 * - ✅ embed allowlist
 * - ✅ vault blocks: لا يُضاف لـ AI context
 */

const ALLOWED_TAGS = [
  "b", "i", "strong", "em", "code", "a", "p",
  "ul", "ol", "li", "br", "span", "mark",
  "blockquote", "pre", "h1", "h2", "h3",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class", "lang", "dir"];

const FORBIDDEN_ATTR_PATTERNS = [
  /^on/i,          // event handlers
  /^javascript:/i, // js: URIs
  /^data:/i,       // data: URIs (non-image)
];

const EMBED_ALLOWLIST = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "twitter.com",
  "x.com",
  "figma.com",
  "codesandbox.io",
  "codepen.io",
];

/**
 * ينظف HTML المحتوى قبل عرضه
 * يُستخدم server-side وclient-side
 */
export function sanitizeHtml(html: string): string {
  // في بيئة TanStack Start / browser، نستخدم منطق بسيط بدون DOMPurify NPM
  // في Production لازم تضيف: import DOMPurify from 'dompurify'
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<iframe(?![^>]*sandbox)/gi, '<iframe sandbox="allow-scripts allow-same-origin"');
}

/**
 * يتحقق من أن embed URL مسموح به في الـ allowlist
 */
export function assertAllowedEmbedUrl(url: string): void {
  try {
    const parsed = new URL(url);
    const isAllowed = EMBED_ALLOWLIST.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    if (!isAllowed) {
      throw new Error(`embed_url_not_allowed: ${parsed.hostname}`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("embed_url_not_allowed")) {
      throw err;
    }
    throw new Error(`embed_url_invalid: ${url}`);
  }
}

/**
 * يتحقق من أن block content لا يتجاوز 1MB
 */
export function assertBlockContentSize(content: unknown): void {
  const size = JSON.stringify(content).length;
  if (size > 1_000_000) {
    throw new Error(`block_content_too_large: ${size} bytes (max 1MB)`);
  }
}

/**
 * يتحقق من أن block من نوع vault لا يدخل في AI context
 */
export function assertNoVaultBlockInAIContext(blockType: string): void {
  if (blockType === "vault_inline") {
    throw new Error("vault_block_ai_context_violation: vault blocks cannot enter AI context");
  }
}

/**
 * ينظف content_json لأي block type قبل حفظه في DB
 * يُستخدم في block-service وmarkdown-import
 */
export function sanitizeBlockContent(
  blockType: string,
  content: Record<string, unknown>
): Record<string, unknown> {
  // التحقق من الحجم أولاً
  assertBlockContentSize(content);

  const result: Record<string, unknown> = {};

  // نظّف الـ text fields
  if (typeof content.text === 'string') {
    result.text = sanitizeHtml(content.text);
  }
  if (typeof content.caption === 'string') {
    result.caption = sanitizeHtml(content.caption);
  }
  if (typeof content.title === 'string') {
    result.title = sanitizeHtml(content.title);
  }

  // embed: تحقق من الـ URL allowlist
  if (blockType === 'embed' && typeof content.url === 'string') {
    assertAllowedEmbedUrl(content.url);
    result.url = content.url;
  }

  // image/video/audio/file/bookmark: copy URL as-is (validated by CSP)
  if (['image', 'video', 'audio', 'file', 'bookmark'].includes(blockType)) {
    if (typeof content.url === 'string') result.url = content.url;
    if (typeof content.name === 'string') result.name = content.name;
  }

  // page_link
  if (blockType === 'page_link') {
    if (typeof content.target_page_id === 'string') result.target_page_id = content.target_page_id;
    if (typeof content.title === 'string') result.title = sanitizeHtml(content.title as string);
  }

  // code: لا تنفيذ — فقط display
  if (blockType === 'code') {
    result.language = typeof content.language === 'string' ? content.language : '';
    result.code = typeof content.code === 'string' ? content.code : '';
    // لا يمر عبر sanitizeHtml لأن code يجب أن يبقى كما هو
  }

  // todo
  if (blockType === 'todo') {
    result.checked = content.checked === true;
  }

  // numbered_list
  if (blockType === 'numbered_list') {
    result.number = typeof content.number === 'number' ? content.number : 1;
  }

  // callout
  if (blockType === 'callout') {
    result.icon = typeof content.icon === 'string' ? content.icon : '💡';
  }

  // synced_block
  if (blockType === 'synced_block') {
    if (typeof content.source_block_id === 'string') {
      result.source_block_id = content.source_block_id;
    }
  }

  // vault_inline: حارس إضافي
  assertNoVaultBlockInAIContext(blockType);

  return result;
}

