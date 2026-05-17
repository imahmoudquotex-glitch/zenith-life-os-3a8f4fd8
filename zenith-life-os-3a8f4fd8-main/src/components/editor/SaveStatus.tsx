/**
 * Wave 06 — Autosave State Machine + Save Status Indicator
 * src/components/editor/SaveStatus.tsx
 */
import React from 'react';

export type SaveState =
  | { kind: 'saved'; at: string }
  | { kind: 'saving' }
  | { kind: 'offline'; queued: number }
  | { kind: 'conflict'; serverVersion: number; localVersion: number }
  | { kind: 'failed'; retry: () => Promise<void> };

interface SaveStatusProps {
  state: SaveState;
}

export function SaveStatus({ state }: SaveStatusProps) {
  if (state.kind === 'saved') {
    return (
      <span
        role="status"
        aria-live="polite"
        style={{ color: '#6B7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <span aria-hidden style={{ color: '#4ADE80' }}>✓</span>
        محفوظ {new Date(state.at).toLocaleTimeString('ar')}
      </span>
    );
  }

  if (state.kind === 'saving') {
    return (
      <span role="status" aria-live="polite" aria-label="جارٍ الحفظ"
        style={{ color: '#6B7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span aria-hidden style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
        جارٍ الحفظ...
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </span>
    );
  }

  if (state.kind === 'offline') {
    return (
      <span role="status" aria-live="polite"
        style={{ color: '#F59E0B', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span aria-hidden>📶</span>
        غير متصل — {state.queued} تعديل في الانتظار
      </span>
    );
  }

  if (state.kind === 'conflict') {
    return (
      <span role="alert"
        style={{ color: '#EF4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span aria-hidden>⚠️</span>
        تعارض في الإصدار — محلي: {state.localVersion} / خادم: {state.serverVersion}
      </span>
    );
  }

  if (state.kind === 'failed') {
    return (
      <span role="alert"
        style={{ color: '#EF4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span aria-hidden>✗</span>
        فشل الحفظ —
        <button
          onClick={() => void state.retry()}
          style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}
        >
          إعادة المحاولة
        </button>
      </span>
    );
  }

  return null;
}
