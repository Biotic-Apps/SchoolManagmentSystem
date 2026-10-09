import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { forbidden } from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { dailyHoursFromTimings } from '../calculation/overtime-pay';
import { PayrollAccess } from '../payroll-access.service';
import type {
  PayrollSettingsDto,
  PayrollSettingsViewDto,
} from './dto/payroll-settings.dto';
import { toRules, type PayrollRules } from './payroll-rules';
import { staffTimings } from './staff-timings';

/** School-wide payroll rules: working days, late rule and overtime. */
@Injectable()
export class PayrollSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly audit: AuditService,
  ) {}

  async rules(schoolId: string): Promise<PayrollRules> {
    return toRules(
      await this.prisma.payrollSettings.findUnique({ where: { schoolId } }),
    );
  }

  async get(scope: Scope, branchId: string): Promise<PayrollSettingsViewDto> {
    const branch = await this.access.branch(scope, branchId);
    return this.view(branch.id, branch.schoolId);
  }

  async put(
    user: AuthUser,
    scope: Scope,
    branchId: string,
    dto: PayrollSettingsDto,
  ): Promise<PayrollSettingsViewDto> {
    // Rules are school-wide; coordinators manage branch payroll but not the rules.
    if (user.activeRole === String(RoleKey.COORDINATOR)) {
      throw forbidden('Only the principal or an admin can change pay rules');
    }
    const branch = await this.access.branch(scope, branchId);
    const before = await this.rules(branch.schoolId);
    const data = {
      workingDaysMode: dto.workingDaysMode,
      fixedWorkingDays: dto.fixedWorkingDays,
      perDayBase: dto.perDayBase,
      latesPerDeduction: dto.latesPerDeduction,
      lateDeductionDays: dto.lateDeductionDays,
      overtimeEnabled: dto.overtimeEnabled,
      overtimeMultiplier: dto.overtimeMultiplier,
      overtimeGraceMinutes: dto.overtimeGraceMinutes,
      dailyHours: dto.dailyHours ?? null,
      updatedById: user.id,
    };
    await this.prisma.payrollSettings.upsert({
      where: { schoolId: branch.schoolId },
      create: { schoolId: branch.schoolId, ...data },
      update: data,
    });
    this.audit.stage({
      action: 'payroll.settings_update',
      entityType: 'PayrollSettings',
      entityId: branch.schoolId,
      schoolId: branch.schoolId,
      before: { ...before },
      after: { ...data },
    });
    return this.view(branch.id, branch.schoolId);
  }

  private async view(
    branchId: string,
    schoolId: string,
  ): Promise<PayrollSettingsViewDto> {
    const [row, branch] = await Promise.all([
      this.prisma.payrollSettings.findUnique({ where: { schoolId } }),
      this.prisma.branch.findUnique({
        where: { id: branchId },
        select: { timings: true },
      }),
    ]);
    const times = staffTimings(branch?.timings);
    return {
      ...toRules(row),
      saved: !!row,
      staffArrivesAt: times?.arrivesAt ?? null,
      staffLeavesAt: times?.leavesAt ?? null,
      branchDailyHours: times
        ? dailyHoursFromTimings(times.arrivesAt, times.leavesAt)
        : null,
    };
  }
}
