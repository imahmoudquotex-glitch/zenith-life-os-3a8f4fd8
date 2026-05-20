// packages/security/src/audit-writer.ts
// Wave: W03 — Re-export writeAuditEvent as the canonical audit writer

export { writeAuditEvent, logAudit } from './audit';
export type { AuditEventInput, AuditAction } from './audit';
