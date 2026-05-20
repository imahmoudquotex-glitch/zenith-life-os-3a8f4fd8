import { TenantRepo } from '@app/repo';
import { BaseService } from './base-service';

export abstract class TenantService<R extends TenantRepo> extends BaseService<R> {
  constructor(repo: R, protected readonly workspaceId: string) {
    super(repo);
  }
}
