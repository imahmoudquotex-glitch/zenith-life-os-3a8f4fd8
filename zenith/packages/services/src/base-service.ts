import { BaseRepo } from '@app/repo';

export abstract class BaseService<R extends BaseRepo> {
  constructor(protected readonly repo: R) {}
}
