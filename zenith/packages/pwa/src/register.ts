// packages/pwa/src/register.ts
// Wave: W03 — Service Worker registration with update detection

import type { ServiceWorkerRegistration as SWReg } from 'typescript/lib/lib.dom';

type OnUpdateReady = (waiting: ServiceWorker) => void;

/**
 * Register the Zenith Service Worker.
 * Must be called once in a client component (not server).
 * Does NOT auto-apply updates — user must approve via onUpdateReady callback.
 */
export async function registerSW(onUpdateReady?: OnUpdateReady): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    // Check for waiting SW on first register
    if (reg.waiting && onUpdateReady) {
      onUpdateReady(reg.waiting);
    }

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdateReady?.(installing);
        }
      });
    });

    // Poll for updates every 60 minutes
    setInterval(() => { void reg.update(); }, 60 * 60 * 1000);

    return reg;
  } catch (err) {
    console.error('[pwa] SW registration failed:', err);
    return null;
  }
}

/**
 * Trigger update — send SKIP_WAITING to waiting SW.
 * Only called after user clicks "Update & Reload" in update toast.
 */
export function applyUpdate(waiting: ServiceWorker): void {
  waiting.postMessage({ type: 'SKIP_WAITING' });
  // Reload after SW takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  }, { once: true });
}
