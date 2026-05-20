import type { JobContext } from './index.js'

export async function handleAuditAnchor(ctx: JobContext): Promise<void> {
  console.log(`[audit-anchor] Computing daily Merkle anchor — jobId=${ctx.jobId}`)
  // TODO: call packages/audit to compute and store daily Merkle root
}
