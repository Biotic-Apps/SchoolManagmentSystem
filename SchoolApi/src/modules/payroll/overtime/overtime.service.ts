import { Injectable } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { formatDate, parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import { periodOf } from '../../finance-core/period';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { PayrollAccess } from '../payroll-access.service';
import { APPROVED_STATUSES } from '../runs/run-status';
import { PayrollSettingsService } from '../settings/payroll-settings.service';
import { staffTimings } from '../settings/staff-timings';
import type {
  CreateOvertimeDto,
  DecideOvertimeDto,
  OvertimeDto,
  OvertimeListDto,
  OvertimeQueryDto,
} from './dto/overtime.dto';

/** Overtime entries of a branch month: manual entry, approval, listing. */
@Injectable()
export class OvertimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: PayrollAccess,
    private readonly settings: PayrollSettingsService,
    private readonly people: SchoolPeopleService,
    private readonly audit: AuditService,
  ) {}

  async list(scope: Scope, query: OvertimeQueryDto): Promise<OvertimeListDto> {
    const branch = await this.access.branch(scope, query.branchId);
    const [rows, locked, rules, timings] = await Promise.all([
      this.prisma.payrollOvertime.findMany({
        where: {
          branchId: branch.id,
          month: query.month,
          ...(query.status ? { status: query.status } : {}),
        },
        include: {
          staff: { select: { id: true, name: true, designation: true } },
        },
        orderBy: [{ date: 'asc' }, { staff: { name: 'asc' } }],
      }),
      this.isLocked(branch.id, query.month),
      this.settings.rules(branch.schoolId),
      this.prisma.branch.findUnique({
        where: { id: branch.id },
        select: { timings: true },
      }),
    ]);
    const checkOuts = await this.prisma.staffAttendance.findMany({
      where: {
        staffId: { in: rows.map((r) => r.staffId) },
        date: { in: rows.map((r) => r.date) },
      },
      select: { staffId: true, date: true, checkOut: true },
    });
    const checkOut = new Map(
      checkOuts.map((c) => [`${c.staffId}|${formatDate(c.date)}`, c.checkOut]),
    );
    const names = await this.people.names(
      rows.flatMap((r) => (r.decidedById ? [r.decidedById] : [])),
    );
    const items: OvertimeDto[] = rows.map((r) => ({
      id: r.id,
      staff: { id: r.staff.id, name: r.staff.name },
      designation: r.staff.designation,
      month: r.month,
      date: formatDate(r.date),
      minutes: r.minutes,
      source: r.source,
      status: r.status,
      reason: r.reason,
      checkOut: checkOut.get(`${r.staffId}|${formatDate(r.date)}`) ?? null,
      decidedBy: r.decidedById
        ? { id: r.decidedById, name: names.get(r.decidedById) ?? '' }
        : null,
      decidedAt: r.decidedAt?.toISOString() ?? null,
      decisionNote: r.decisionNote,
    }));
    return {
      items,
      pendingCount: items.filter((i) => i.status === 'PENDING').length,
      approvedMinutes: items
        .filter((i) => i.status === 'APPROVED')
        .reduce((sum, i) => sum + i.minutes, 0),
      staffLeavesAt: staffTimings(timings?.timings)?.leavesAt ?? null,
      overtimeEnabled: rules.overtimeEnabled,
      locked,
    };
  }

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateOvertimeDto,
  ): Promise<{ id: string }> {
    const staff = await this.access.staff(scope, dto.staffId);
    if (staff.userId === user.id) {
      throw forbidden('You cannot add overtime for yourself');
    }
    const month = periodOf(parseDate(dto.date));
    await this.assertOpen(staff.branchId, month);
    const existing = await this.prisma.payrollOvertime.findUnique({
      where: {
        staffId_date_source: {
          staffId: staff.id,
          date: parseDate(dto.date),
          source: 'MANUAL',
        },
      },
    });
    if (existing && existing.status !== 'PENDING') {
      throw conflict('Overtime for this day is already decided');
    }
    const data = {
      minutes: dto.minutes,
      reason: dto.reason.trim(),
      createdById: user.id,
    };
    const row = existing
      ? await this.prisma.payrollOvertime.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.payrollOvertime.create({
          data: {
            ...data,
            schoolId: staff.schoolId,
            branchId: staff.branchId,
            staffId: staff.id,
            month,
            date: parseDate(dto.date),
            source: 'MANUAL',
          },
        });
    this.audit.stage({
      action: 'payroll.overtime_add',
      entityType: 'PayrollOvertime',
      entityId: row.id,
      schoolId: staff.schoolId,
      branchId: staff.branchId,
      after: { staffId: staff.id, date: dto.date, minutes: dto.minutes },
    });
    return { id: row.id };
  }

  /** Approves or rejects entries; nobody decides their own overtime. */
  async decide(
    user: AuthUser,
    scope: Scope,
    dto: DecideOvertimeDto,
  ): Promise<{ updated: number }> {
    const rows = await this.prisma.payrollOvertime.findMany({
      where: { id: { in: dto.ids } },
      include: { staff: { select: { userId: true } } },
    });
    if (rows.length !== new Set(dto.ids).size) throw notFound('Overtime');
    for (const row of rows) {
      await this.access.branch(scope, row.branchId);
      await this.assertOpen(row.branchId, row.month);
      if (row.staff.userId === user.id) {
        throw forbidden('You cannot approve your own overtime');
      }
    }
    const updated = await this.prisma.payrollOvertime.updateMany({
      where: { id: { in: dto.ids } },
      data: {
        status: dto.decision,
        decidedById: user.id,
        decidedAt: new Date(),
        decisionNote: dto.note?.trim() || null,
      },
    });
    for (const row of rows) {
      this.audit.stage({
        action: `payroll.overtime_${dto.decision.toLowerCase()}`,
        entityType: 'PayrollOvertime',
        entityId: row.id,
        schoolId: row.schoolId,
        branchId: row.branchId,
        before: { status: row.status },
        after: { status: dto.decision, minutes: row.minutes },
      });
    }
    return { updated: updated.count };
  }

  /** Removes a manual entry that is still pending. */
  async remove(scope: Scope, id: string): Promise<void> {
    const row = await this.prisma.payrollOvertime.findUnique({ where: { id } });
    if (!row) throw notFound('Overtime');
    await this.access.branch(scope, row.branchId);
    if (row.source !== 'MANUAL' || row.status !== 'PENDING') {
      throw invalid('Only pending hand-entered overtime can be removed');
    }
    await this.prisma.payrollOvertime.delete({ where: { id } });
  }

  async assertOpen(branchId: string, month: string): Promise<void> {
    if (await this.isLocked(branchId, month)) {
      throw conflict(`Payroll for ${month} is already approved`, {
        reason: 'RUN_APPROVED',
      });
    }
  }

  private async isLocked(branchId: string, month: string): Promise<boolean> {
    const run = await this.prisma.payrollRun.findUnique({
      where: { branchId_month: { branchId, month } },
      select: { status: true },
    });
    return !!run && APPROVED_STATUSES.includes(run.status);
  }
}
