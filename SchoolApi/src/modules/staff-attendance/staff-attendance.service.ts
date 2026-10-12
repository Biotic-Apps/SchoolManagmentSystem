import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { formatDate, parseDate } from '../../core/common/dates';
import { invalid, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import { UrlSigner } from '../../core/files/url-signer';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { tally } from '../attendance/attendance-tally';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { WorkingDayService } from '../school-day/working-day.service';
import type {
  MyStaffAttendanceDto,
  MyStaffAttendanceQueryDto,
  SaveStaffAttendanceDto,
  StaffAttendanceDayDto,
} from './dto/staff-attendance.dto';

/** Staff register per branch day, marked by office/principal (flows §7.2). */
@Injectable()
export class StaffAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly people: SchoolPeopleService,
    private readonly workingDays: WorkingDayService,
    private readonly audit: AuditService,
    private readonly signer: UrlSigner,
  ) {}

  async day(
    scope: Scope,
    branchId: string,
    date?: string,
  ): Promise<StaffAttendanceDayDto> {
    await this.managedBranch(scope, branchId);
    const day = date ? parseDate(date) : today();
    const staff = await this.prisma.staff.findMany({
      where: { branchId, status: { in: ['ACTIVE', 'ON_LEAVE'] } },
      orderBy: { name: 'asc' },
      include: { attendance: { where: { date: day } } },
    });
    return {
      branchId,
      date: formatDate(day),
      entries: staff.map((s) => {
        const row = s.attendance[0];
        return {
          staffId: s.id,
          name: s.name,
          designation: s.designation,
          photoUrl: s.photoFileId ? this.signer.sign(s.photoFileId).url : null,
          status: row?.status ?? null,
          checkIn: row?.checkIn ?? null,
          checkOut: row?.checkOut ?? null,
          remark: row?.remark ?? null,
        };
      }),
    };
  }

  async save(
    user: AuthUser,
    scope: Scope,
    dto: SaveStaffAttendanceDto,
  ): Promise<StaffAttendanceDayDto> {
    const branch = await this.managedBranch(scope, dto.branchId);
    const date = parseDate(dto.date);
    if (date > today()) throw invalid('Attendance cannot be marked ahead');
    await this.workingDays.assertWorkingDay(branch.id, date);
    const ids = dto.entries.map((e) => e.staffId);
    const known = await this.prisma.staff.count({
      where: { id: { in: ids }, branchId: branch.id },
    });
    if (known !== new Set(ids).size)
      throw invalid('Staff must belong to this branch');
    await this.prisma.$transaction(
      dto.entries.map((e) => {
        const values = {
          status: e.status,
          checkIn: e.checkIn ?? null,
          checkOut: e.checkOut ?? null,
          remark: e.remark ?? null,
          markedById: user.id,
        };
        return this.prisma.staffAttendance.upsert({
          where: { staffId_date: { staffId: e.staffId, date } },
          create: {
            ...values,
            schoolId: branch.schoolId,
            branchId: branch.id,
            staffId: e.staffId,
            date,
          },
          update: values,
        });
      }),
    );
    this.audit.stage({
      action: 'staff_attendance.save',
      entityType: 'Branch',
      entityId: branch.id,
      schoolId: branch.schoolId,
      branchId: branch.id,
      after: { date: dto.date, entries: dto.entries },
    });
    return this.day(scope, branch.id, dto.date);
  }

  async mine(
    user: AuthUser,
    query: MyStaffAttendanceQueryDto,
  ): Promise<MyStaffAttendanceDto> {
    const staff = await this.people.staffOfUser(user.id);
    if (!staff) throw notFound('Staff profile');
    const to = query.to ? parseDate(query.to) : today();
    const from = query.from
      ? parseDate(query.from)
      : new Date(to.getTime() - 30 * 86_400_000);
    const rows = await this.prisma.staffAttendance.findMany({
      where: { staffId: staff.id, date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    });
    const days = await this.workingDays.between(staff.branchId, from, to);
    const marked = new Set(rows.map((r) => formatDate(r.date)));
    const unmarked = days.filter((d) => !marked.has(formatDate(d))).length;
    return {
      records: rows.map((r) => ({
        date: formatDate(r.date),
        status: r.status,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        remark: r.remark,
      })),
      summary: tally([
        ...rows.map((r) => r.status),
        ...Array<null>(unmarked).fill(null),
      ]),
    };
  }

  private async managedBranch(scope: Scope, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch || scope.guardian) throw notFound('Branch');
    scope.assertManageBranch(branch);
    return branch;
  }
}
