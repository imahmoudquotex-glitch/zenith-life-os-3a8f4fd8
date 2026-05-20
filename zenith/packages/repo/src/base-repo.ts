export abstract class BaseRepo<TEntity> {
  protected abstract table: string;
  constructor(protected readonly db: any) {}

  async findById(id: string, workspaceId: string): Promise<TEntity | null> {
    return this.db.oneOrNone(
      `SELECT * FROM ${this.table}
       WHERE id = $1 AND workspace_id = $2 AND is_deleted = false`,
      [id, workspaceId],
    );
  }

  async softDelete(id: string, workspaceId: string, actorId: string) {
    return this.db.none(
      `UPDATE ${this.table}
       SET is_deleted = true, deleted_at = now(), last_edited_by_user_id = $3
       WHERE id = $1 AND workspace_id = $2`,
      [id, workspaceId, actorId],
    );
  }
}
