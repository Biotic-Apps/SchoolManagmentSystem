import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { forbidden } from '../../../core/common/errors/errors';
import { toJson } from '../../../core/common/prisma-json';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { currentMonth, PayrollAccess } from '../payroll-access.service';
import { sortStructures, structureFor } from './current-structure';
import type {
  PutSalaryStructureDto,
  SalaryStructuresDto,
} from './dto/salary-structure.dto';
import { toSalaryStructureDto } from './salary-structure.mapper';

/** Append-only salary structure history per staff member. */
@Injectable()
export class SalaryStructureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async get(scope: Scope, staffId: string): Promise<SalaryStructuresDto> {
    await this.access.staff(scope, staffId);
    const rows = sortStructures(
      await this.prisma.salaryStructure.findMany({ where: { staffId } }),
    );
    const names = await this.people.names(rows.map((r) => r.createdById));
    const current = structureFor(rows, currentMonth());
    return {
      current: current ? toSalaryStructureDto(current, names) : null,
      history: rows.map((row) => toSalaryStructureDto(row, names)),
    };
  }

  async put(
    user: AuthUser,
    scope: Scope,
    staffId: string,
    dto: PutSalaryStructureDto,
  ): Promise<SalaryStructuresDto> {
    const staff = await this.access.staff(scope, staffId);
    if (staff.userId === user.id) {
      throw forbidden('You cannot change your own salary structure');
    }
    const row = await this.prisma.salaryStructure.create({
      data: {
        schoolId: staff.schoolId,
        branchId: staff.branchId,
        staffId,
        effectiveFrom: dto.effectiveFrom,
        basicMinor: BigInt(dto.basicMinor),
        allowances: toJson(dto.allowances),
        deductions: toJson(dto.deductions),
        reason: dto.reason?.trim() || null,
        createdById: user.id,
      },
    });
    this.audit.stage({
      action: 'payroll.structure_set',
      entityType: 'SalaryStructure',
      entityId: row.id,
      schoolId: staff.schoolId,
      branchId: staff.branchId,
      after: {
        staffId,
        effectiveFrom: dto.effectiveFrom,
        basicMinor: dto.basicMinor,
        allowances: dto.allowances,
        deductions: dto.deductions,
        reason: row.reason,
      },
    });
    return this.get(scope, staffId);
  }
}
