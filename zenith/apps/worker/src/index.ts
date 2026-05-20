/**
 * Worker entrypoint — lease-based background job processor.
 * W01 invariant: MUST use DB-level leases. No duplicate job execution.
 */

import { Scheduler } from './scheduler.js'

const POLL_INTERVAL_MS = parseInt(process.env['WORKER_POLL_MS'] ?? '5000', 10)
const WORKER_ID = `worker-${process.pid}-${Date.now()}`

console.log(`[worker] Starting Zenith Worker — id=${WORKER_ID}`)
console.log(`[worker] Poll interval: ${POLL_INTERVAL_MS}ms`)

const scheduler = new Scheduler({
  workerId: WORKER_ID,
  pollIntervalMs: POLL_INTERVAL_MS,
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[worker] SIGTERM received — shutting down gracefully')
  await scheduler.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[worker] SIGINT received — shutting down gracefully')
  await scheduler.stop()
  process.exit(0)
})

scheduler.start().catch((err: unknown) => {
  console.error('[worker] Fatal error:', err)
  process.exit(1)
})
