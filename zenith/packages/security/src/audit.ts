import { PoolClient } from 'pg';

export async function logAudit(
  client: PoolClient,
  workspaceId: string,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  changes: Record<string, unknown>
) {
  await client.query(
    `INSERT INTO public.audit_logs (workspace_id, actor_id, action, target_type, target_id, changes)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [workspaceId, actorId, action, targetType, targetId, JSON.stringify(changes)]
  );
}
