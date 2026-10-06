import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { SchoolPolicies } from '../../../core/school-settings/school-policies';
import { SchoolSettingsReader } from '../../../core/school-settings/school-settings.reader';
import { BRANCH_SETTING_DEFAULTS } from './branch-settings.defaults';

export interface OfficeHours {
  from: string;
  to: string;
}

const APPROVAL_LIMIT_PREFIX = 'approval.limits.';

/** School policy value used when a branch has no row of its own. */
function fromSchoolPolicy(policies: SchoolPolicies, key: string): unknown {
  if (key === 'attendance.lockTime') return policies.attendanceLockTime;
  if (key === 'diary.moderation') return policies.diaryModeration;
  if (key.startsWith(APPROVAL_LIMIT_PREFIX)) {
    const limit =
      policies.approvalLimits[key.slice(APPROVAL_LIMIT_PREFIX.length)];
    return typeof limit === 'number' ? { PRINCIPAL: limit } : undefined;
  }
  return undefined;
}

const usesSchoolPolicy = (key: string): boolean =>
  key === 'attendance.lockTime' ||
  key === 'diary.moderation' ||
  key.startsWith(APPROVAL_LIMIT_PREFIX);

/**
 * Internal read of one setting (no scope check): the branch row, else the
 * school policy for keys it covers (phase5-contract §A), else the default.
 */
@Injectable()
export class BranchSettingsReader {
  /** A branch never moves to another school, so this map never goes stale. */
  private readonly schoolOfBranch = new Map<string, string | null>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly schoolSettings: SchoolSettingsReader,
  ) {}

  async get<T>(branchId: string, key: string): Promise<T> {
    const row = await this.prisma.branchSetting.findUnique({
      where: { branchId_key: { branchId, key } },
    });
    if (row?.value != null) return row.value as T;
    if (usesSchoolPolicy(key)) {
      const schoolId = await this.schoolId(branchId);
      if (schoolId) {
        const policies = await this.schoolSettings.policies(schoolId);
        const value = fromSchoolPolicy(policies, key);
        if (value !== undefined) return value as T;
      }
    }
    return BRANCH_SETTING_DEFAULTS[key] as T;
  }

  private async schoolId(branchId: string): Promise<string | null> {
    if (this.schoolOfBranch.has(branchId)) {
      return this.schoolOfBranch.get(branchId)!;
    }
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { schoolId: true },
    });
    const schoolId = branch?.schoolId ?? null;
    if (schoolId) this.schoolOfBranch.set(branchId, schoolId);
    return schoolId;
  }
}
