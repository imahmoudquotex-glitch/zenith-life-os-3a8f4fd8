// packages/offline/src/connectivity.ts
// Wave: W03 — Online/offline detection with debounce

type ConnectivityListener = (online: boolean) => void;
const _listeners = new Set<ConnectivityListener>();

let _online = typeof navigator !== 'undefined' ? navigator.onLine : true;

export function isOnline(): boolean {
  return _online;
}

export function onConnectivityChange(fn: ConnectivityListener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

function _notify(online: boolean): void {
  _online = online;
  for (const fn of _listeners) {
    try { fn(online); } catch { /* ignore listener errors */ }
  }
}

// Register browser events once
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => _notify(true));
  window.addEventListener('offline', () => _notify(false));
}
