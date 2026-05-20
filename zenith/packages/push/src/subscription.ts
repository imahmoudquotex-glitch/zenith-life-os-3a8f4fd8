// packages/push/src/subscription.ts
// Wave: W03 — VAPID push subscription management (client side)

/**
 * Subscribe to push notifications.
 * Uses NEXT_PUBLIC_VAPID_PUBLIC_KEY env var.
 * VAPID_PRIVATE_KEY must NEVER appear on the client (enforced by check-vapid-key-not-in-client.ts).
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
    return null;
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    return subscription;
  } catch (err) {
    console.error('[push] subscribe failed:', err);
    return null;
  }
}

/**
 * Send subscription to server for storage in push_subscriptions table.
 */
export async function saveSubscriptionToServer(
  subscription: PushSubscription,
  idempotencyKey: string,
): Promise<void> {
  const sub = subscription.toJSON();
  await fetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: sub.keys?.p256dh,
      auth: sub.keys?.auth,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
  });
}

/**
 * Unsubscribe and notify server.
 */
export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const sub = await registration.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
