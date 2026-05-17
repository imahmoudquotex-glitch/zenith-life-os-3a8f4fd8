/**
 * Wave 06 — Markdown Export
 * src/lib/block-engine/markdown-export.ts
 *
 * تحويل blocks إلى Markdown سليم
 * القواعد:
 * - لا AI في هذا الملف
 * - يدعم 15+ block type
 * - RTL-aware (عربي ← code LTR)
 */

import type { Block } from './block-repo';

function escape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\[/g, '\\[');
}

function getText(block: Block): string {
  return String(block.content_json?.text ?? '');
}

function blockToMarkdown(block: Block, depth = 0): string {
  const indent = '  '.repeat(depth);
  const text = getText(block);

  switch (block.type) {
    case 'paragraph':
      return text ? `${indent}${text}\n` : '';

    case 'heading_1':
      return `# ${text}\n`;

    case 'heading_2':
      return `## ${text}\n`;

    case 'heading_3':
      return `### ${text}\n`;

    case 'bulleted_list':
      return `${indent}- ${text}\n`;

    case 'numbered_list': {
      const num = Number(block.content_json?.number ?? 1);
      return `${indent}${num}. ${text}\n`;
    }

    case 'todo': {
      const checked = block.content_json?.checked === true;
      return `${indent}- [${checked ? 'x' : ' '}] ${text}\n`;
    }

    case 'toggle':
      return `${indent}<details>\n${indent}<summary>${text}</summary>\n${indent}</details>\n`;

    case 'quote':
      return `> ${text}\n`;

    case 'callout': {
      const icon = String(block.content_json?.icon ?? '💡');
      return `> ${icon} **${text}**\n`;
    }

    case 'divider':
      return `---\n`;

    case 'code': {
      const lang = String(block.content_json?.language ?? '');
      const code = String(block.content_json?.code ?? '');
      return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case 'image': {
      const url = String(block.content_json?.url ?? '');
      const alt = String(block.content_json?.caption ?? 'image');
      return `![${escape(alt)}](${url})\n`;
    }

    case 'video': {
      const url = String(block.content_json?.url ?? '');
      return `[Video](${url})\n`;
    }

    case 'audio': {
      const url = String(block.content_json?.url ?? '');
      return `[Audio](${url})\n`;
    }

    case 'file': {
      const url = String(block.content_json?.url ?? '');
      const name = String(block.content_json?.name ?? 'file');
      return `[${escape(name)}](${url})\n`;
    }

    case 'bookmark': {
      const url = String(block.content_json?.url ?? '');
      const title = String(block.content_json?.title ?? url);
      return `[${escape(title)}](${url})\n`;
    }

    case 'page_link': {
      const pageId = String(block.content_json?.target_page_id ?? '');
      const title = String(block.content_json?.title ?? pageId);
      return `[[${escape(title)}]]\n`;
    }

    case 'table_of_contents':
      return `<!-- table of contents -->\n`;

    case 'column_list':
    case 'column':
    case 'database_inline':
    case 'synced_block':
    case 'template_button':
    case 'embed':
      // يُصدّر كـ placeholder
      return `<!-- ${block.type} -->\n`;

    default:
      return `<!-- unknown: ${block.type} -->\n`;
  }
}

/**
 * يحوّل قائمة blocks لصفحة كاملة إلى Markdown
 */
export function blocksToMarkdown(blocks: Block[]): string {
  const result: string[] = [];

  // بناء شجرة بسيطة بالترتيب
  const roots = blocks.filter((b) => !b.parent_block_id);
  const byParent: Record<string, Block[]> = {};
  for (const block of blocks) {
    if (block.parent_block_id) {
      if (!byParent[block.parent_block_id]) byParent[block.parent_block_id] = [];
      byParent[block.parent_block_id].push(block);
    }
  }

  function renderBlock(block: Block, depth: number) {
    result.push(blockToMarkdown(block, depth));
    const children = byParent[block.id] ?? [];
    const sorted = [...children].sort((a, b) => a.position - b.position);
    for (const child of sorted) {
      renderBlock(child, depth + 1);
    }
  }

  const sortedRoots = [...roots].sort((a, b) => a.position - b.position);
  for (const root of sortedRoots) {
    renderBlock(root, 0);
  }

  return result.join('\n');
}
