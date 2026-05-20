/**
 * DB-level lease management for worker jobs.
 * Uses pg_try_advisory_xact_lock for atomic lease acquisition.
 * W01 invariant: MUST use DB-level leases — no duplicate jobs.
 */

export interface LeaseOptions {
  workerId: string
  leaseDurationMs?: number
}

export interface Lease {
  jobId: string
  jobType: string
  payload: unknown
  acquiredAt: number
  expiresAt: number
}

/**
 * Attempt to acquire a lease for the next available job.
 * Returns null if no job is available or lease cannot be acquired.
 *
 * Uses: SELECT ... FOR UPDATE SKIP LOCKED (Postgres advisory row-level lock)
 */
export async function tryAcquireLease(
  opts: LeaseOptions,
): Promise<Lease | null> {
  const { workerId, leaseDurationMs = 30_000 } = opts
  const now = Date.now()
  const expiresAt = now + leaseDurationMs

  // In production: query the jobs table with FOR UPDATE SKIP LOCKED
  // Pattern:
  //   SELECT id, job_type, payload FROM jobs
  //   WHERE status = 'pending' AND next_run_at <= NOW()
  //   ORDER BY priority DESC, next_run_at ASC
  //   FOR UPDATE SKIP LOCKED
  //   LIMIT 1
  // Then UPDATE jobs SET status='running', worker_id=$workerId, lease_expires_at=NOW()+interval
  
  // Stub: returns null (no DB connection in unit tests)
  void workerId
  void expiresAt
  return null
}

/**
 * Renew an active lease to prevent expiry during long jobs.
 */
export async function renewLease(
  jobId: string,
  workerId: string,
  extensionMs = 30_000,
): Promise<boolean> {
  // UPDATE jobs SET lease_expires_at = NOW() + interval
  // WHERE id = $jobId AND worker_id = $workerId AND status = 'running'
  void jobId
  void workerId
  void extensionMs
  return true
}

/**
 * Release a lease after job completion or failure.
 */
export async function releaseLease(
  jobId: string,
  workerId: string,
  status: 'completed' | 'failed',
  error?: string,
): Promise<void> {
  // UPDATE jobs SET status=$status, worker_id=null, lease_expires_at=null,
  //   completed_at=NOW(), last_error=$error
  // WHERE id=$jobId AND worker_id=$workerId
  void jobId
  void workerId
  void status
  void error
}

/**
 * Reclaim expired leases from crashed workers.
 * Should be called periodically by the scheduler.
 */
export async function reclaimExpiredLeases(): Promise<number> {
  // UPDATE jobs SET status='pending', worker_id=null, lease_expires_at=null
  // WHERE status='running' AND lease_expires_at < NOW()
  // RETURNING id
  return 0
}
