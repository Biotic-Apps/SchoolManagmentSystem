import { Injectable } from '@nestjs/common';
import type { ComplaintCategory } from '../../generated/prisma/client';
import { RoleKey } from '../../core/rbac/role-key.enum';
import { BranchSettingsReader } from '../branches/settings/branch-settings.reader';
import { SchoolPeopleService } from '../school-day/school-people.service';
import type { RoutingCandidates } from './complaint-routing';
import { DEFAULT_SLA_HOURS } from './complaint-status';

/** Loads routing candidates and SLA deadlines for a complaint's branch. */
@Injectable()
export class ComplaintRouterService {
  constructor(
    private readonly people: SchoolPeopleService,
    private readonly settings: BranchSettingsReader,
  ) {}

  async candidates(
    branchId: string | null,
    sectionId: string | null,
  ): Promise<RoutingCandidates> {
    const [classTeacher, coordinators, principal, superAdmins] =
      await Promise.all([
        sectionId ? this.people.classTeacher(sectionId) : null,
        branchId ? this.people.roleHolders(branchId, RoleKey.COORDINATOR) : [],
        branchId ? this.people.principalOf(branchId) : null,
        this.people.superAdmins(),
      ]);
    return {
      classTeacherUserId: classTeacher?.userId ?? null,
      coordinatorUserIds: coordinators,
      principalUserId: principal,
      superAdminUserIds: superAdmins,
    };
  }

  async slaDueAt(
    branchId: string | null,
    category: ComplaintCategory,
    now = new Date(),
  ): Promise<Date> {
    const value = branchId
      ? await this.settings.get<unknown>(branchId, 'complaints.slaHours')
      : DEFAULT_SLA_HOURS;
    return new Date(now.getTime() + slaHours(value, category) * 3_600_000);
  }
}

/** The setting is a number of hours, or hours per category. */
export function slaHours(value: unknown, category: ComplaintCategory): number {
  if (typeof value === 'number' && value > 0) return value;
  if (value && typeof value === 'object') {
    const hours = (value as Record<string, unknown>)[category];
    if (typeof hours === 'number' && hours > 0) return hours;
  }
  return DEFAULT_SLA_HOURS;
}
