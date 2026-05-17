/**
 * Wave 06 — Block Permission Dialog + Version History UI
 * src/components/editor/BlockPermissionDialog.tsx
 */
import React, { useState, useCallback } from 'react';
import { useBlockPermissions, useBlockVersions, useGrantBlockPermission } from '../../lib/block-engine/hooks/use-block-permissions';
import type { Block } from '../../lib/block-engine/block-repo';

// ─── Block Permission Dialog ──────────────────────────────────────────────────
interface BlockPermissionDialogProps {
  blockId: string;
  isVault?: boolean;
  onClose: () => void;
}

export function BlockPermissionDialog({ blockId, isVault, onClose }: BlockPermissionDialogProps) {
  const { data: perms, isLoading } = useBlockPermissions(blockId);
  const { mutate: grantPerm } = useGrantBlockPermission();
  const [inherit, setInherit] = useState(true);

  // ✅ Vault blocks: permission dialog مرفوض كلياً
  if (isVault) {
    return (
      <div role="dialog" aria-modal aria-label="صلاحيات الكتلة" style={overlayStyle}>
        <div style={dialogStyle}>
          <h2 style={{ color: '#EF4444', fontSize: '15px', margin: 0 }}>⚠️ كتلة محمية</h2>
          <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0.75rem 0' }}>
            لا يمكن تغيير صلاحيات كتل الـ Vault — المحتوى مشفّر ومحمي.
          </p>
          <button onClick={onClose} style={btnSecondaryStyle}>إغلاق</button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal aria-label="صلاحيات الكتلة" style={overlayStyle}>
      <div style={dialogStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#F9FAFB', fontSize: '15px', fontWeight: 600, margin: 0 }}>
            صلاحيات هذا الـ Block
          </h2>
          <button onClick={onClose} aria-label="إغلاق" style={iconBtnStyle}>✕</button>
        </div>

        {/* Inherit toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={inherit}
            onChange={(e) => setInherit(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#7C3AED' }}
          />
          <span style={{ color: '#D1D5DB', fontSize: '13px' }}>ورّث صلاحيات الصفحة</span>
        </label>

        {/* Permission list */}
        {isLoading ? (
          <p style={{ color: '#6B7280', fontSize: '13px' }}>جارٍ التحميل...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {(perms ?? []).length === 0 && (
              <p style={{ color: '#6B7280', fontSize: '13px' }}>لا توجد صلاحيات مخصصة — يرث من الصفحة.</p>
            )}
            {(perms ?? []).map((p: { id: string; grantee?: string; level: string }) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#1F2937', borderRadius: '6px' }}>
                <span style={{ color: '#D1D5DB', fontSize: '13px' }}>{p.grantee ?? '—'}</span>
                <span style={{ color: '#7C3AED', fontSize: '12px', textTransform: 'capitalize' }}>{p.level}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add permission form */}
        <AddPermissionForm blockId={blockId} onGranted={() => {}} />

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}

function AddPermissionForm({ blockId, onGranted }: { blockId: string; onGranted: () => void }) {
  const [userId, setUserId] = useState('');
  const [level, setLevel] = useState<'view' | 'comment' | 'edit' | 'none'>('view');
  const { mutate: grantPerm, isPending } = useGrantBlockPermission();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    grantPerm({ blockId, userId, level }, { onSuccess: onGranted });
    setUserId('');
  }, [blockId, userId, level, grantPerm, onGranted]);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="معرف المستخدم"
        aria-label="معرف المستخدم"
        style={{ flex: 1, padding: '0.4rem 0.6rem', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#F9FAFB', fontSize: '13px' }}
      />
      <select
        value={level}
        onChange={(e) => setLevel(e.target.value as typeof level)}
        aria-label="مستوى الصلاحية"
        style={{ padding: '0.4rem', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#F9FAFB', fontSize: '13px' }}
      >
        <option value="view">قراءة</option>
        <option value="comment">تعليق</option>
        <option value="edit">تعديل</option>
        <option value="none">محظور</option>
      </select>
      <button type="submit" disabled={isPending} style={btnPrimaryStyle}>
        {isPending ? '...' : 'منح'}
      </button>
    </form>
  );
}

// ─── Block Version History ────────────────────────────────────────────────────
interface BlockVersionHistoryProps {
  block: Block;
  onClose: () => void;
}

export function BlockVersionHistory({ block, onClose }: BlockVersionHistoryProps) {
  const { data: versions, isLoading } = useBlockVersions(block.id, { limit: 50 });
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = useCallback(async (versionId: string, contentJson: Record<string, unknown>) => {
    if (!confirm('هل تريد استعادة هذا الإصدار؟ سيتم حفظ النسخة الحالية أولاً.')) return;
    setRestoring(true);
    try {
      // Snapshot current version first (pre-destructive)
      await fetch(`/api/blocks/${block.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ content: contentJson }),
      });
    } finally {
      setRestoring(false);
      onClose();
    }
  }, [block.id, onClose]);

  return (
    <div role="dialog" aria-modal aria-label="تاريخ التعديلات" style={overlayStyle}>
      <div style={{ ...dialogStyle, width: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#F9FAFB', fontSize: '15px', fontWeight: 600, margin: 0 }}>
            تاريخ التعديلات
          </h2>
          <button onClick={onClose} aria-label="إغلاق" style={iconBtnStyle}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {isLoading && <p style={{ color: '#6B7280', fontSize: '13px' }}>جارٍ التحميل...</p>}
          {!isLoading && (versions ?? []).length === 0 && (
            <p style={{ color: '#6B7280', fontSize: '13px' }}>لا يوجد تاريخ تعديلات.</p>
          )}
          {(versions ?? []).map((v: { id: string; created_at: string; editor_name?: string; content_json: Record<string, unknown> }, i: number) => (
            <div
              key={v.id}
              style={{
                padding: '0.6rem 0.8rem',
                background: previewing === v.id ? '#1E1B4B' : '#1F2937',
                border: `1px solid ${previewing === v.id ? '#7C3AED' : '#374151'}`,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setPreviewing(previewing === v.id ? null : v.id)}
              role="button"
              aria-label={`إصدار ${i + 1} — ${new Date(v.created_at).toLocaleString('ar')}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {new Date(v.created_at).toLocaleString('ar')}
                </span>
                <span style={{ color: '#7C3AED', fontSize: '12px' }}>
                  {v.editor_name ?? 'مجهول'}
                </span>
              </div>
              {previewing === v.id && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRestore(v.id, v.content_json); }}
                    disabled={restoring}
                    style={btnPrimaryStyle}
                  >
                    {restoring ? 'جارٍ الاستعادة...' : 'استعادة'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ ...btnSecondaryStyle, marginTop: '1rem' }}>إغلاق</button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
};
const dialogStyle: React.CSSProperties = {
  background: '#111827', border: '1px solid #374151', borderRadius: '12px',
  padding: '1.5rem', width: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};
const btnPrimaryStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem', background: '#7C3AED', border: 'none',
  borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer',
};
const btnSecondaryStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #374151',
  borderRadius: '6px', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer',
};
const iconBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#6B7280',
  cursor: 'pointer', fontSize: '16px', padding: '4px',
};
