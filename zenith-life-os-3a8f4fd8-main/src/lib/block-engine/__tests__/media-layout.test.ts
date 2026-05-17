import { describe, it, expect } from 'vitest';
import type { Block, BlockType } from '../block-repo';
import { sanitizeBlockContent } from '../sanitizer';

describe('Media and Layout Blocks (Phase 07 missing tests)', () => {
  it('sanitizes audio block contents', () => {
    const rawContent = { url: 'https://example.com/audio.mp3', caption: 'Audio test <script>alert(1)</script>' };
    const sanitized = sanitizeBlockContent('audio', rawContent);
    expect(sanitized.url).toBe('https://example.com/audio.mp3');
    expect(sanitized.caption).toBe('Audio test ');
  });

  it('sanitizes file block contents', () => {
    const rawContent = { url: 'https://example.com/file.pdf', title: 'Test File', size: 1024 };
    const sanitized = sanitizeBlockContent('file', rawContent);
    expect(sanitized.url).toBe('https://example.com/file.pdf');
    expect(sanitized.title).toBe('Test File');
  });

  it('sanitizes column_list and column block contents', () => {
    const rawContent = { text: 'test column' };
    const sanitizedColList = sanitizeBlockContent('column_list', rawContent);
    const sanitizedCol = sanitizeBlockContent('column', rawContent);
    expect(sanitizedColList).toEqual({ text: 'test column' });
    expect(sanitizedCol).toEqual({ text: 'test column' });
  });
});
