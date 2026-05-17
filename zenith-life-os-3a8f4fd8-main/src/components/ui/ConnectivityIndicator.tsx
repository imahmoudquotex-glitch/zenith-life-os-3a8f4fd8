/**
 * Wave 06 — Connectivity Indicator + Offline Outbox Processor
 * src/components/ui/ConnectivityIndicator.tsx
 *
 * قواعد:
 * - ✅ يراقب navigator.onLine
 * - ✅ يعيد محاولة الـ outbox عند الاتصال
 * - ✅ لا يخزن secrets في الـ outbox
 */
import React, { useEffect, useState, useCallback } from 'react';

const OUTBOX_KEY = 'zenith:block:outbox';

interface ConnectivityIndicatorProps {
  onFlushOutbox?: () => Promise<void>;
}

export function ConnectivityIndicator({ onFlushOutbox }: ConnectivityIndicatorProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isFlushing, setIsFlushing] = useState(false);

  const refreshPending = useCallback(() => {
    try {
      const raw = localStorage.getItem(OUTBOX_KEY);
      const queue = raw ? (JSON.parse(raw) as unknown[]) : [];
      setPendingCount(queue.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    refreshPending();
    const timer = setInterval(refreshPending, 5000);
    return () => clearInterval(timer);
  }, [refreshPending]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-flush outbox when back online
      if (onFlushOutbox && pendingCount > 0) {
        setIsFlushing(true);
        try {
          await onFlushOutbox();
          localStorage.removeItem(OUTBOX_KEY);
          setPendingCount(0);
        } catch {
          // Will retry next time
        } finally {
          setIsFlushing(false);
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onFlushOutbox, pendingCount]);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isOnline ? 'يتم مزامنة التغييرات' : 'غير متصل بالإنترنت'}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        insetInlineStart: '50%',
        transform: 'translateX(-50%)',
        background: isOnline ? 'hsl(142, 70%, 20%)' : 'hsl(0, 60%, 20%)',
        border: `1px solid ${isOnline ? 'hsl(142, 70%, 35%)' : 'hsl(0, 60%, 35%)'}`,
        borderRadius: '999px',
        padding: '0.5rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '13px',
        color: isOnline ? 'hsl(142, 80%, 75%)' : 'hsl(0, 80%, 75%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Status dot */}
      <span
        aria-hidden
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isOnline ? '#4ADE80' : '#EF4444',
          animation: !isOnline ? 'pulse 2s infinite' : undefined,
          flexShrink: 0,
        }}
      />

      {isOnline ? (
        isFlushing ? (
          'جارٍ مزامنة التغييرات...'
        ) : (
          `${pendingCount} تغيير في الانتظار`
        )
      ) : (
        `أنت غير متصل — ${pendingCount > 0 ? `${pendingCount} تغيير محفوظ محلياً` : 'التغييرات محفوظة محلياً'}`
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
