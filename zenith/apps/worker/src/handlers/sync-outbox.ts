import type { JobContext } from './index.js'

export async function handleSyncOutbox(ctx: JobContext): Promise<void> {
  console.log(`[sync-outbox] Processing outbox sync — jobId=${ctx.jobId}`)
  // TODO: process pending outbox mutations via packages/offline
}
