import { Injectable } from '@nestjs/common';
import type { ApprovalStepInput } from '../../core/approvals/approval.service';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';

/** Approval types whose approvers are limited by amount (contract H). */
export type LimitedApprovalType =
  'CONCESSION' | 'REFUND' | 'EXPENSE' | 'PURCHASE_ORDER';

/** Approvers that may hold an amount limit, lowest first. */
const LIMIT_LADDER: RoleKey[] = [RoleKey.ACCOUNTANT, RoleKey.PRINCIPAL];

const RANK: Partial<Record<string, number>> = {
  [RoleKey.ACCOUNTANT]: 1,
  [RoleKey.PRINCIPAL]: 2,
  [RoleKey.SUPER_ADMIN]: 3,
};

const rankOf = (role: string) => RANK[role] ?? 0;

/**
 * security.md §2: each configured role approves up to its limit; above it the
 * request escalates. Only roles ranked above the requester take part (nobody
 * approves their own request). The last step has no limit: the principal when
 * no principal limit is configured, otherwise the super admin.
 */
export function limitedApprovalSteps(
  limits: Readonly<Record<string, number>>,
  requesterRole: string,
): ApprovalStepInput[] {
  const requesterRank = rankOf(requesterRole);
  const steps: ApprovalStepInput[] = [];
  for (const role of LIMIT_LADDER) {
    if (rankOf(role) <= requesterRank) continue;
    const limit = limits[role];
    if (limit === undefined) {
      steps.push({ approverRole: role });
      return steps;
    }
    steps.push({ approverRole: role, amountLimitMinor: BigInt(limit) });
  }
  steps.push({ approverRole: RoleKey.SUPER_ADMIN });
  return steps;
}

/**
 * Single-step approvals decided by the principal; a principal's (or super
 * admin's) own request goes to the super admin instead.
 */
export function principalOrAbove(requesterRole: string): ApprovalStepInput[] {
  return rankOf(requesterRole) >= rankOf(RoleKey.PRINCIPAL)
    ? [{ approverRole: RoleKey.SUPER_ADMIN }]
    : [{ approverRole: RoleKey.PRINCIPAL }];
}

@Injectable()
export class ApprovalRouting {
  constructor(private readonly settings: BranchSettingsReader) {}

  /** `approval.limits.<TYPE>` ({ ROLE: amountMinor }), else legacy `approval.limits[TYPE]` for the principal. */
  async limits(
    branchId: string,
    type: LimitedApprovalType,
  ): Promise<Record<string, number>> {
    const perType = await this.settings.get<Record<string, number> | null>(
      branchId,
      `approval.limits.${type}`,
    );
    const legacy = await this.settings.get<Record<string, number> | null>(
      branchId,
      'approval.limits',
    );
    const merged: Record<string, number> = { ...(perType ?? {}) };
    if (
      legacy?.[type] !== undefined &&
      merged[RoleKey.PRINCIPAL] === undefined
    ) {
      merged[RoleKey.PRINCIPAL] = legacy[type];
    }
    return merged;
  }

  async steps(
    branchId: string,
    type: LimitedApprovalType,
    requesterRole: string,
  ): Promise<ApprovalStepInput[]> {
    return limitedApprovalSteps(
      await this.limits(branchId, type),
      requesterRole,
    );
  }
}
