/**
 * Wave 06 — Unit Tests: Block Engine Core
 * src/lib/block-engine/__tests__/block-service.test.ts
 *
 * Coverage target: ≥ 80%
 * - addBlock, editBlock, deleteBlock, moveBlock, duplicateBlock
 * - convertBlock, bulkAddBlocks, addSyncedBlock (cycle detection)
 * - sanitizer, cycle-detector, fractional-index
 * - markdown-export, markdown-import
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePositionBetween, needsRenormalize } from '../fractional-index';
import { detectCycle } from '../cycle-detector';
import { sanitizeBlockContent } from '../sanitizer';
import { blocksToMarkdown as exportBlocksToMarkdown } from '../markdown-export';
import { markdownToBlocks as importMarkdownToBlocks } from '../markdown-import';

// ─── Fractional Index ────────────────────────────────────────────────────────
describe('fractional-index', () => {
  it('generates midpoint between two positions', () => {
    const pos = generatePositionBetween(1, 3);
    expect(pos).toBeGreaterThan(1);
    expect(pos).toBeLessThan(3);
  });

  it('generates position after last (null next)', () => {
    const pos = generatePositionBetween(10, null);
    expect(pos).toBeGreaterThan(10);
  });

  it('generates position before first (null prev)', () => {
    const pos = generatePositionBetween(null, 5);
    expect(pos).toBeLessThan(5);
  });

  it('generates initial position when both null', () => {
    const pos = generatePositionBetween(null, null);
    expect(typeof pos).toBe('number');
    expect(pos).toBeGreaterThan(0);
  });

  it('detects renormalize need when gap < threshold', () => {
    expect(needsRenormalize(1.0, 1.0001)).toBe(true);
    expect(needsRenormalize(1.0, 2.0)).toBe(false);
  });
});

// ─── Cycle Detector ──────────────────────────────────────────────────────────
describe('cycle-detector', () => {
  it('detects a simple cycle A→B→A', () => {
    const nodes = ['A', 'B'];
    const edges: [string, string][] = [['A', 'B'], ['B', 'A']];
    expect(detectCycle(nodes, edges)).toBe(true);
  });

  it('returns false for acyclic graph', () => {
    const nodes = ['A', 'B', 'C'];
    const edges: [string, string][] = [['A', 'B'], ['B', 'C']];
    expect(detectCycle(nodes, edges)).toBe(false);
  });

  it('detects self-loop', () => {
    expect(detectCycle(['A'], [['A', 'A']])).toBe(true);
  });

  it('handles empty graph', () => {
    expect(detectCycle([], [])).toBe(false);
  });
});

// ─── Sanitizer ───────────────────────────────────────────────────────────────
describe('sanitizeBlockContent', () => {
  it('strips script tags from paragraph text', () => {
    const result = sanitizeBlockContent('paragraph', {
      text: '<script>alert("xss")</script>Hello',
    });
    expect(JSON.stringify(result)).not.toContain('<script>');
    expect(JSON.stringify(result)).toContain('Hello');
  });

  it('allows safe HTML in paragraph', () => {
    const result = sanitizeBlockContent('paragraph', {
      text: '<strong>مرحبا</strong>',
    });
    expect(JSON.stringify(result)).toContain('مرحبا');
  });

  it('sanitizes embed URL — rejects javascript:', () => {
    const result = sanitizeBlockContent('embed', {
      url: 'javascript:alert(1)',
    });
    expect(JSON.stringify(result)).not.toContain('javascript:');
  });

  it('preserves safe embed URL', () => {
    const result = sanitizeBlockContent('embed', {
      url: 'https://www.youtube.com/embed/abc123',
    });
    expect(JSON.stringify(result)).toContain('youtube.com');
  });

  it('preserves todo checked state', () => {
    const result = sanitizeBlockContent('todo', { text: 'مهمة', checked: true });
    expect((result as { checked?: boolean }).checked).toBe(true);
  });
});

// ─── Markdown Export ─────────────────────────────────────────────────────────
describe('exportBlocksToMarkdown', () => {
  const makeBlock = (type: string, overrides = {}) => ({
    id: 'b1',
    workspace_id: 'ws1',
    page_id: 'p1',
    type,
    content_json: {},
    position: 1,
    depth: 0,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  it('exports paragraph', () => {
    const md = exportBlocksToMarkdown([makeBlock('paragraph', { content_json: { text: 'مرحبا' } }) as never]);
    expect(md).toContain('مرحبا');
  });

  it('exports heading_1', () => {
    const md = exportBlocksToMarkdown([makeBlock('heading_1', { content_json: { text: 'العنوان' } }) as never]);
    expect(md).toMatch(/^# العنوان/m);
  });

  it('exports todo with checkbox', () => {
    const md = exportBlocksToMarkdown([makeBlock('todo', { content_json: { text: 'مهمة', checked: false } }) as never]);
    expect(md).toContain('- [ ]');
  });

  it('exports divider', () => {
    const md = exportBlocksToMarkdown([makeBlock('divider') as never]);
    expect(md).toContain('---');
  });

  it('exports empty blocks list as empty string', () => {
    expect(exportBlocksToMarkdown([])).toBe('');
  });
});

// ─── Markdown Import ─────────────────────────────────────────────────────────
describe('importMarkdownToBlocks', () => {
  it('imports heading', () => {
    const blocks = importMarkdownToBlocks('# العنوان الأول\n');
    expect(blocks.some((b: { type: string }) => b.type === 'heading_1')).toBe(true);
  });

  it('imports paragraph', () => {
    const blocks = importMarkdownToBlocks('هذه فقرة عادية\n');
    expect(blocks.some((b: { type: string }) => b.type === 'paragraph')).toBe(true);
  });

  it('imports bulleted list', () => {
    const blocks = importMarkdownToBlocks('- بند أول\n- بند ثاني\n');
    expect(blocks.filter((b: { type: string }) => b.type === 'bulleted_list').length).toBe(2);
  });

  it('imports todo', () => {
    const blocks = importMarkdownToBlocks('- [ ] مهمة\n- [x] مكتملة\n');
    expect(blocks.filter((b: { type: string }) => b.type === 'todo').length).toBe(2);
  });

  it('imports code block', () => {
    const blocks = importMarkdownToBlocks('```js\nconsole.log("hi");\n```\n');
    expect(blocks.some((b: { type: string }) => b.type === 'code')).toBe(true);
  });

  it('imports divider', () => {
    const blocks = importMarkdownToBlocks('---\n');
    expect(blocks.some((b: { type: string }) => b.type === 'divider')).toBe(true);
  });

  it('sanitizes XSS in imported markdown', () => {
    const blocks = importMarkdownToBlocks('<script>alert(1)</script> نص\n');
    const allContent = JSON.stringify(blocks);
    expect(allContent).not.toContain('<script>');
  });

  it('returns empty array for empty input', () => {
    expect(importMarkdownToBlocks('')).toEqual([]);
  });
});
