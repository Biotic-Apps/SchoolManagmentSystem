import { Injectable } from '@nestjs/common';
import {
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { isPrincipal, isSuperAdmin } from '../../../core/rbac/actor';
import type { Scope } from '../../../core/rbac/scope/scope';
import { CHECKLIST_KEYS } from './checklist-keys';
import { ChecklistRepository } from './checklist.repository';
import type { ChecklistQueryDto } from './dto/checklist-query.dto';
import type { SetupChecklistDto } from './dto/setup-checklist.dto';

/** GET /setup/checklist: principal (own branch) and Super Admin (any branch). */
@Injectable()
export class ChecklistService {
  constructor(private readonly repository: ChecklistRepository) {}

  async checklist(
    user: AuthUser,
    scope: Scope,
    query: ChecklistQueryDto,
  ): Promise<SetupChecklistDto> {
    const branchId = this.branchIdFor(user, scope, query);
    const branch = await this.repository.findBranch(branchId);
    if (!branch) throw notFound('Branch');
    scope.assertManageBranch(branch);

    const counts = await this.repository.counts(branch);
    const items = CHECKLIST_KEYS.map((key) => ({
      key,
      // allocation counts what is missing: done when nothing is left and sections exist.
      done:
        key === 'allocation'
          ? counts.allocation === 0 && counts.sections > 0
          : counts[key] > 0,
      count: counts[key],
    }));
    return {
      branchId: branch.id,
      complete: items.every((item) => item.done),
      items,
    };
  }

  private branchIdFor(
    user: AuthUser,
    scope: Scope,
    query: ChecklistQueryDto,
  ): string {
    if (isSuperAdmin(user)) {
      if (query.branchId) return query.branchId;
      const message = 'branchId is required';
      throw invalid(message, [message]);
    }
    if (!isPrincipal(user))
      throw forbidden(
        'Only a principal or Super Admin sees the setup checklist',
      );
    const own = query.branchId ?? [...scope.branchIds][0];
    if (!own) throw forbidden('No branch assigned');
    return own;
  }
}
