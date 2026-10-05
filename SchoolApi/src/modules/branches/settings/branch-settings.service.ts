import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { forbidden, invalid } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { isPrincipal } from '../../../core/rbac/actor';
import type { Scope } from '../../../core/rbac/scope/scope';
import { BranchesService } from '../branches.service';
import {
  BRANCH_SETTING_DEFAULTS,
  validateSetting,
} from './branch-settings.defaults';
import { BranchSettingsRepository } from './branch-settings.repository';

@Injectable()
export class BranchSettingsService {
  constructor(
    private readonly branches: BranchesService,
    private readonly repository: BranchSettingsRepository,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, branchId: string): Promise<Record<string, unknown>> {
    await this.branches.find(scope, branchId);
    return {
      ...BRANCH_SETTING_DEFAULTS,
      ...(await this.repository.load(branchId)),
    };
  }

  /** `settings.edit`, or the principal of this branch. */
  async update(
    user: AuthUser,
    scope: Scope,
    branchId: string,
    values: Record<string, unknown>,
  ) {
    const branch = await this.branches.find(scope, branchId);
    scope.assertManageBranch(branch);
    if (!user.permissions.has('settings.edit') && !isPrincipal(user)) {
      throw forbidden(
        'Only administrators or the branch principal can change settings',
      );
    }
    const errors = Object.entries(values)
      .map(([key, value]) => validateSetting(key, value))
      .filter((error) => error !== null);
    if (errors.length > 0) throw invalid('Invalid settings', errors);
    if (Object.keys(values).length === 0) throw invalid('No settings given');

    const before = await this.get(scope, branchId);
    await this.repository.save(branchId, values, user.id);
    const after = await this.get(scope, branchId);
    this.audit.stage({
      action: 'branch.settings_update',
      entityType: 'Branch',
      entityId: branchId,
      schoolId: branch.schoolId,
      branchId,
      before,
      after,
    });
    return after;
  }
}
