import { PoolClient } from 'pg';
import { BaseRepo } from './base-repo';
import { InternalError } from '@app/result';

export abstract class TenantRepo extends BaseRepo {
  constructor(client: PoolClient, protected readonly workspaceId: string) {
    super(client);
  }

  protected async setTenantContext(): Promise<void> {
    try {
      await this.client.query(`SELECT set_config('app.current_tenant', $1, true)`, [this.workspaceId]);
    } catch (err) {
      throw new InternalError();
    }
  }
}
