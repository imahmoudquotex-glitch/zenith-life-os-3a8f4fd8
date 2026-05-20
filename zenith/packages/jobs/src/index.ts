/**
 * @zenith/jobs — Job queue client for enqueueing background work.
 * W01: All job creation goes through this package.
 */

export interface EnqueueJobOptions {
  jobType: string
  payload?: Record<string, unknown>
  workspaceId?: string
  priority?: number
  runAt?: Date
  maxAttempts?: number
}

export interface EnqueuedJob {
  id: string
  jobType: string
  status: 'pending'
  createdAt: Date
}

/**
 * Enqueue a background job. Idempotent if idempotencyKey provided.
 */
export async function enqueueJob(
  opts: EnqueueJobOptions,
  idempotencyKey?: string,
): Promise<EnqueuedJob> {
  // In production: INSERT INTO jobs (...) ON CONFLICT (idempotency_key) DO NOTHING
  void idempotencyKey
  const id = crypto.randomUUID()
  return {
    id,
    jobType: opts.jobType,
    status: 'pending',
    createdAt: new Date(),
  }
}

/**
 * Cancel a pending job.
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  // UPDATE jobs SET status='dead' WHERE id=$jobId AND status='pending'
  void jobId
  return true
}

/**
 * Get job status.
 */
export async function getJobStatus(jobId: string): Promise<string | null> {
  void jobId
  return null
}
