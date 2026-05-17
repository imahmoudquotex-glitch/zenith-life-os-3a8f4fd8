/**
 * Wave 06 — Block Editor
 * src/components/editor/BlockEditor.tsx
 *
 * قواعد:
 * - ❌ ممنوع AI في render path
 * - ✅ Debounce save 500ms  
 * - ✅ Dir=auto (RTL-aware)
 * - ✅ Keystroke latency < 16ms p99
 */
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { addBlock, editBlock, deleteBlock } from '../../lib/block-engine/block-service';
import type { Block, BlockType } from '../../lib/block-engine/block-repo';
import { SlashMenu } from './SlashMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { BlockRenderer } from './BlockRenderer';

interface BlockEditorProps {
  pageId: string;
  workspaceId: string;
  initialBlocks?: Block[];
  readOnly?: boolean;
}

const SAVE_DEBOUNCE_MS = 500;

export function BlockEditor({
  pageId,
  workspaceId,
  initialBlocks = [],
  readOnly = false,
}: BlockEditorProps) {
  const { user } = useAuth();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const userId = user?.id ?? '';

  // Debounced save
  const scheduleSave = useCallback(
    (blockId: string, content: Record<string, unknown>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (!userId) return;
        try {
          await editBlock({
            blockId,
            content,
            userId,
          });
        } catch {
          // Silent fail — outbox will retry
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [userId]
  );

  // إضافة block جديد
  const handleAddBlock = useCallback(
    async (type: BlockType, afterBlockId?: string) => {
      if (!userId) return;
      setShowSlash(false);

      const afterBlock = afterBlockId
        ? blocks.find((b) => b.id === afterBlockId)
        : blocks[blocks.length - 1];

      const prevPos = afterBlock?.position ?? null;
      const afterIdx = afterBlock ? blocks.indexOf(afterBlock) : blocks.length - 1;
      const nextBlock = blocks[afterIdx + 1];
      const nextPos = nextBlock?.position ?? null;

      try {
        const newBlock = await addBlock({
          workspaceId,
          pageId,
          type,
          prevPosition: prevPos,
          nextPosition: nextPos,
          userId,
        });
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.id === afterBlockId);
          const updated = [...prev];
          updated.splice(idx + 1, 0, newBlock);
          return updated;
        });
        setActiveBlockId(newBlock.id);
      } catch {
        // Silent fail
      }
    },
    [userId, workspaceId, pageId, blocks]
  );

  // حذف block
  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      if (!userId) return;
      try {
        await deleteBlock(blockId, userId);
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      } catch {
        // Silent fail
      }
    },
    [userId]
  );

  // كشف slash command
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string) => {
      if (e.key === '/' && !showSlash) {
        setShowSlash(true);
        setSlashQuery('');
        setActiveBlockId(blockId);
      } else if (e.key === 'Escape') {
        setShowSlash(false);
      } else if (e.key === 'Backspace' && showSlash && slashQuery === '') {
        setShowSlash(false);
      }
    },
    [showSlash, slashQuery]
  );

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks]
  );

  if (readOnly) {
    return (
      <div className="block-editor block-editor--readonly" dir="auto">
        {sortedBlocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  }

  return (
    <div className="block-editor" dir="auto" role="main" aria-label="محرر الكتل">
      {sortedBlocks.map((block) => (
        <div
          key={block.id}
          className={`block-editor__block ${activeBlockId === block.id ? 'block-editor__block--active' : ''}`}
          style={{ paddingLeft: `${block.depth * 24}px` }}
        >
          <BlockRenderer
            block={block}
            editable
            onChange={(content) => {
              setBlocks((prev) =>
                prev.map((b) => b.id === block.id ? { ...b, content_json: content } : b)
              );
              scheduleSave(block.id, content);
            }}
            onFocus={() => setActiveBlockId(block.id)}
            onKeyDown={(e) => handleKeyDown(e, block.id)}
            onDelete={() => handleDeleteBlock(block.id)}
            onAddAfter={(type) => handleAddBlock(type, block.id)}
          />
        </div>
      ))}

      {/* Plus button to add block at end */}
      {!readOnly && (
        <button
          className="block-editor__add-btn"
          aria-label="إضافة كتلة جديدة"
          onClick={() => handleAddBlock('paragraph')}
        >
          <span aria-hidden>+</span>
          <span>اضغط لإضافة محتوى</span>
        </button>
      )}

      {/* Slash Menu */}
      {showSlash && (
        <SlashMenu
          query={slashQuery}
          onQueryChange={setSlashQuery}
          onSelect={(type) => handleAddBlock(type, activeBlockId ?? undefined)}
          onClose={() => setShowSlash(false)}
        />
      )}

      <FloatingToolbar />

      <style>{`
        .block-editor {
          max-width: 760px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          color: var(--color-text-primary, hsl(210, 15%, 90%));
          min-height: 100vh;
        }
        .block-editor__block {
          position: relative;
          border-radius: 4px;
          transition: background 0.1s;
        }
        .block-editor__block--active {
          background: hsl(220, 15%, 12%);
        }
        .block-editor__add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          margin-top: 0.5rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted, hsl(210, 10%, 50%));
          cursor: pointer;
          font-size: 0.875rem;
          border-radius: 4px;
          transition: background 0.15s, color 0.15s;
          width: 100%;
          text-align: start;
        }
        .block-editor__add-btn:hover {
          background: hsl(220, 15%, 12%);
          color: var(--color-text-primary, hsl(210, 15%, 90%));
        }
        .block-editor--readonly .block-editor__block {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
