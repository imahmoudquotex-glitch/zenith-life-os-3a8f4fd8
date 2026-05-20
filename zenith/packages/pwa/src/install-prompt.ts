// packages/pwa/src/install-prompt.ts
// Wave: W03 — A2HS install prompt capture

let _prompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Capture the prompt globally once
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _prompt = e as BeforeInstallPromptEvent;
  });
}

/**
 * Show the A2HS install prompt if available.
 * Returns true if user accepted.
 */
export async function promptInstall(): Promise<boolean> {
  if (!_prompt) return false;
  await _prompt.prompt();
  const { outcome } = await _prompt.userChoice;
  _prompt = null;
  return outcome === 'accepted';
}

/**
 * True if there is a pending install prompt available.
 */
export function canInstall(): boolean {
  return _prompt !== null;
}
