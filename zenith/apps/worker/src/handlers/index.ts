/**
 * Job handler registry — maps job type strings to handler functions.
 */

export interface JobContext {
  jobId: string
  payload: unknown
  workerId: string
}

export type JobHandler = (ctx: JobContext) => Promise<void>

// Import individual handlers
import { handleSendEmail } from './send-email.js'
import { handleSyncOutbox } from './sync-outbox.js'
import { handleAuditAnchor } from './audit-anchor.js'

export const jobHandlers: Record<string, JobHandler> = {
  'send-email': handleSendEmail,
  'sync-outbox': handleSyncOutbox,
  'audit-anchor': handleAuditAnchor,
}
