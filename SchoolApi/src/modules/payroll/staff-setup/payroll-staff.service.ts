import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import { conflict, invalid } from '../../../core/common/errors/errors';
import { schoolDate } from '../../../core/common/school-time';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { sumMinor } from '../../finance-core/money';
import { currentMonth, PayrollAccess } from '../payroll-access.service';
import { parseComponents, structureFor } from '../structures/current-structure';
import type {
  BranchPrincipalDto,
  PayrollStaffListDto,
  StaffSalarySummaryDto,
} from './dto/payroll-staff.dto';

/** Designation of a principal's payroll staff record. */
export const PRINCIPAL_DESIGNATION = 'PRINCIPAL';

type StructureRow = {
  effectiveFrom: string;
  createdAt: Date;
  basicMinor: bigint;
  allowances: unknown;
  deductions: unknown;
  overtimeRateMinor: bigint | null;
};

function summary(row: StructureRow | null): StaffSalarySummaryDto | null {
  if (!row) return null;
  const total = (v: unknown) =>
    sumMinor(parseComponents(v).map((c) => BigInt(c.amountMinor)));
  const allowances = total(row.allowances);
  return {
    effectiveFrom: row.effectiveFrom,
    basicMinor: Number(row.basicMinor),
    allowancesMinor: Number(allowances),
    deductionsMinor: Number(total(row.deductions)),
    grossMinor: Number(row.basicMinor + allowances),
    overtimeRateMinor:
      row.overtimeRateMinor === null ? null : Number(row.overtimeRateMinor),
  };
}

/** Who is on payroll in a branch (every staff type) and the principal's record. */
@Injectable()
export class PayrollStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly audit: AuditService,
  ) {}

  async list(
    scope: Scope,
    branchId: string,
    designation?: string,
  ): Promise<PayrollStaffListDto> {
    const branch = await this.access.branch(scope, branchId);
    const staff = await this.prisma.staff.findMany({
      where: {
        branchId: branch.id,
        status: { in: ['ACTIVE', 'ON_LEAVE'] },
        ...(designation ? { designation } : {}),
      },
      include: { salaryStructures: true },
      orderBy: [{ designation: 'asc' }, { name: 'asc' }],
    });
    const month = currentMonth();
    const items = staff.map((s) => ({
      staffId: s.id,
      name: s.name,
      designation: s.designation,
      employeeNo: s.employeeNo,
      status: s.status,
      salary: summary(structureFor(s.salaryStructures, month)),
    }));
    return {
      items,
      missingCount: items.filter((i) => !i.salary).length,
      principal: await this.principal(branch.id, branch.principalUserId),
    };
  }

  private async principal(
    branchId: string,
    userId: string | null,
  ): Promise<BranchPrincipalDto | null> {
    if (!userId) return null;
    const [user, staff] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      this.prisma.staff.findUnique({
        where: { userId },
        select: { id: true },
      }),
    ]);
    if (!user) return null;
    return { userId, name: user.name, staffId: staff?.id ?? null };
  }

  /** Gives the branch principal a staff record so a salary can be set. */
  async addPrincipal(
    user: AuthUser,
    scope: Scope,
    branchId: string,
  ): Promise<BranchPrincipalDto> {
    const branch = await this.access.branch(scope, branchId);
    if (!branch.principalUserId) {
      throw invalid('This branch has no principal yet');
    }
    const principal = await this.prisma.user.findUniqueOrThrow({
      where: { id: branch.principalUserId },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (
      await this.prisma.staff.findUnique({ where: { userId: principal.id } })
    ) {
      throw conflict('The principal is already on payroll');
    }
    const staff = await this.prisma.staff.create({
      data: {
        schoolId: branch.schoolId,
        branchId: branch.id,
        userId: principal.id,
        name: principal.name,
        email: principal.email,
        phone: principal.phone,
        designation: PRINCIPAL_DESIGNATION,
        joinDate: parseDate(schoolDate()),
        createdById: user.id,
      },
    });
    this.audit.stage({
      action: 'payroll.principal_added',
      entityType: 'Staff',
      entityId: staff.id,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: { userId: principal.id, designation: PRINCIPAL_DESIGNATION },
    });
    return { userId: principal.id, name: principal.name, staffId: staff.id };
  }
}
