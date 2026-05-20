/**
 * Job scheduler — cron-based polling loop with lease coordination.
 * W01 invariant: MUST use DB leases to prevent duplicate execution.
 */

import { tryAcquireLease, releaseLease, reclaimExpiredLeases } from './leases.js'
import { jobHandlers } from './handlers/index.js'

export interface SchedulerOptions {
  workerId: string
  pollIntervalMs?: number
}

export class Scheduler {
  private readonly workerId: string
  private readonly pollIntervalMs: number
  private running = false
  private timer: NodeJS.Timeout | null = null

  constructor(opts: SchedulerOptions) {
    this.workerId = opts.workerId
    this.pollIntervalMs = opts.pollIntervalMs ?? 5_000
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    console.log(`[scheduler] Started — workerId=${this.workerId}`)
    this.schedule()
  }

  async stop(): Promise<void> {
    this.running = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    console.log('[scheduler] Stopped')
  }

  private schedule(): void {
    if (!this.running) return
    this.timer = setTimeout(async () => {
      await this.tick()
      this.schedule()
    }, this.pollIntervalMs)
  }

  private async tick(): Promise<void> {
    try {
      // 1. Reclaim expired leases from crashed workers
      const reclaimed = await reclaimExpiredLeases()
      if (reclaimed > 0) {
        console.log(`[scheduler] Reclaimed ${reclaimed} expired leases`)
      }

      // 2. Try to acquire a job
      const lease = await tryAcquireLease({ workerId: this.workerId })
      if (!lease) return // No jobs available

      console.log(`[scheduler] Acquired job ${lease.jobId} (type=${lease.jobType})`)

      // 3. Dispatch to handler
      const handler = jobHandlers[lease.jobType]
      if (!handler) {
        console.error(`[scheduler] No handler for job type: ${lease.jobType}`)
        await releaseLease(lease.jobId, this.workerId, 'failed', `No handler: ${lease.jobType}`)
        return
      }

      try {
        await handler({ jobId: lease.jobId, payload: lease.payload, workerId: this.workerId })
        await releaseLease(lease.jobId, this.workerId, 'completed')
        console.log(`[scheduler] Job ${lease.jobId} completed`)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[scheduler] Job ${lease.jobId} failed: ${msg}`)
        await releaseLease(lease.jobId, this.workerId, 'failed', msg)
      }
    } catch (err: unknown) {
      console.error('[scheduler] Tick error:', err)
    }
  }
}
