import { Injectable } from '@nestjs/common';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { Scope } from '../../core/rbac/scope/scope';
import { StaffRepository, type StaffRow } from './staff.repository';

@Injectable()
export class StaffAccessService {
  constructor(private readonly repository: StaffRepository) {}

  async read(scope: Scope, id: string): Promise<StaffRow> {
    const row = await this.load(id);
    if (!scope.canReadBranch({ id: row.branchId, schoolId: row.schoolId }))
      throw forbiddenScope();
    return row;
  }

  async manage(scope: Scope, id: string): Promise<StaffRow> {
    const row = await this.load(id);
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  private async load(id: string): Promise<StaffRow> {
    const row = await this.repository.findById(id);
    if (!row) throw notFound('Staff');
    return row;
  }
}
