/**
 * Wave 06 — Markdown Import
 * src/lib/block-engine/markdown-import.ts
 *
 * تحويل Markdown إلى blocks جاهزة للإدراج
 * القواعد:
 * - يُمرّر كل text عبر sanitizer
 * - لا يُدرج روابط خارجية مباشرة في embed
 * - يُنتج CreateBlockInput[] مع positions متسلسلة
 */

import { sanitizeBlockContent } from './sanitizer';
import type { BlockType } from './block-repo';

export interface ImportedBlock {
  type: BlockType;
  content_json: Record<string, unknown>;
  depth: number;
}

const HEADING_RE = /^(#{1,3})\s+(.+)$/;
const BULLETED_RE = /^(\s*)[-*]\s+(.+)$/;
const NUMBERED_RE = /^(\s*)(\d+)\.\s+(.+)$/;
const TODO_RE = /^(\s*)-\s+\[(x| )\]\s+(.+)$/i;
const QUOTE_RE = /^>\s*(.+)$/;
const DIVIDER_RE = /^---+$/;
const CODE_START_RE = /^```(\w*)$/;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
const WIKI_RE = /^\[\[([^\]]+)\]\]$/;

function indentDepth(spaces: string): number {
  return Math.floor(spaces.length / 2);
}

/**
 * يُحوّل نص Markdown إلى قائمة ImportedBlock
 */
export function markdownToBlocks(markdown: string): ImportedBlock[] {
  const lines = markdown.split('\n');
  const blocks: ImportedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // تجاهل الأسطر الفارغة
    if (!trimmed) { i++; continue; }

    // Code block
    const codeMatch = CODE_START_RE.exec(trimmed);
    if (codeMatch) {
      const lang = codeMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const raw = { language: lang, code: codeLines.join('\n') };
      blocks.push({
        type: 'code',
        content_json: sanitizeBlockContent('code', raw),
        depth: 0,
      });
      continue;
    }

    // Headings
    const headingMatch = HEADING_RE.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const type: BlockType = level === 1 ? 'heading_1' : level === 2 ? 'heading_2' : 'heading_3';
      blocks.push({
        type,
        content_json: sanitizeBlockContent(type, { text: headingMatch[2] }),
        depth: 0,
      });
      i++;
      continue;
    }

    // Todo
    const todoMatch = TODO_RE.exec(line);
    if (todoMatch) {
      blocks.push({
        type: 'todo',
        content_json: sanitizeBlockContent('todo', {
          text: todoMatch[3],
          checked: todoMatch[2].toLowerCase() === 'x',
        }),
        depth: indentDepth(todoMatch[1] ?? ''),
      });
      i++;
      continue;
    }

    // Bulleted list
    const bulletMatch = BULLETED_RE.exec(line);
    if (bulletMatch) {
      blocks.push({
        type: 'bulleted_list',
        content_json: sanitizeBlockContent('bulleted_list', { text: bulletMatch[2] }),
        depth: indentDepth(bulletMatch[1]),
      });
      i++;
      continue;
    }

    // Numbered list
    const numberedMatch = NUMBERED_RE.exec(line);
    if (numberedMatch) {
      blocks.push({
        type: 'numbered_list',
        content_json: sanitizeBlockContent('numbered_list', {
          text: numberedMatch[3],
          number: parseInt(numberedMatch[2], 10),
        }),
        depth: indentDepth(numberedMatch[1]),
      });
      i++;
      continue;
    }

    // Quote
    const quoteMatch = QUOTE_RE.exec(trimmed);
    if (quoteMatch) {
      blocks.push({
        type: 'quote',
        content_json: sanitizeBlockContent('quote', { text: quoteMatch[1] }),
        depth: 0,
      });
      i++;
      continue;
    }

    // Divider
    if (DIVIDER_RE.test(trimmed)) {
      blocks.push({ type: 'divider', content_json: {}, depth: 0 });
      i++;
      continue;
    }

    // Image
    const imageMatch = IMAGE_RE.exec(trimmed);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        content_json: sanitizeBlockContent('image', {
          caption: imageMatch[1],
          url: imageMatch[2],
        }),
        depth: 0,
      });
      i++;
      continue;
    }

    // Wiki link (page link)
    const wikiMatch = WIKI_RE.exec(trimmed);
    if (wikiMatch) {
      blocks.push({
        type: 'page_link',
        content_json: sanitizeBlockContent('page_link', { title: wikiMatch[1] }),
        depth: 0,
      });
      i++;
      continue;
    }

    // Link (bookmark or file)
    const linkMatch = LINK_RE.exec(trimmed);
    if (linkMatch) {
      blocks.push({
        type: 'bookmark',
        content_json: sanitizeBlockContent('bookmark', {
          title: linkMatch[1],
          url: linkMatch[2],
        }),
        depth: 0,
      });
      i++;
      continue;
    }

    // Default: paragraph
    blocks.push({
      type: 'paragraph',
      content_json: sanitizeBlockContent('paragraph', { text: trimmed }),
      depth: 0,
    });
    i++;
  }

  return blocks;
}
