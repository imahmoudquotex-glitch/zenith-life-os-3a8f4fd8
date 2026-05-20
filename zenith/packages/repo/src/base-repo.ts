import { PoolClient } from 'pg';
import { InternalError } from '@app/result';
import { logger } from '@app/shared/logger';

export abstract class BaseRepo {
  constructor(protected readonly client: PoolClient) {}

  protected async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const result = await this.client.query(sql, params);
      return result.rows;
    } catch (err) {
      logger.error({ err, sql }, 'db.query.failed');
      throw new InternalError();
    }
  }
}
