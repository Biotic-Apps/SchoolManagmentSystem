import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { ApprovalService } from '../../core/approvals/approval.service';
import { AuditService } from '../../core/audit/audit.service';
import { formatDate, parseDate } from '../../core/common/dates';
import {
  conflict,
  forbidden,
  invalid,
  notFound,
} from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileRefService } from '../../core/files/file-ref.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrincipal } from '../../core/rbac/actor';
import { RoleKey } from '../../core/rbac/role-key.enum';
import type { Scope } from '../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../school-day/school-people.service';
import { StudentPlacementService } from '../school-day/student-placement.service';
import { WorkingDayService } from '../school-day/working-day.service';
import type { CreateLeaveDto, LeaveDto } from './dto/leave.dto';
import { LEAVE_INCLUDE, toLeaveDto } from './leave.mapper';

/** Student leave (parent) and staff leave (self); decided via LEAVE approvals. */
@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placement: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly workingDays: WorkingDayService,
    private readonly approvals: ApprovalService,
    private readonly files: FileRefService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
  ) {}

  async create(
    user: AuthUser,
    scope: Scope,
    dto: CreateLeaveDto,
  ): Promise<LeaveDto> {
    const from = parseDate(dto.from);
    const to = parseDate(dto.to);
    if (to < from) throw invalid('to must be on or after from');
    const target = await this.target(user, scope, dto);
    if (dto.attachmentFileId) {
      await this.files.assertUsable(dto.attachmentFileId, {
        schoolId: target.schoolId,
        userId: user.id,
        purposes: ['ATTACHMENT', 'DOCUMENT'],
      });
    }
    const days = (await this.workingDays.between(target.branchId, from, to))
      .length;
    if (days === 0) throw invalid('No working days in the range');
    await this.assertNoOverlap(target, from, to);

    const approver =
      target.staffId && isPrincipal(user)
        ? RoleKey.SUPER_ADMIN
        : RoleKey.PRINCIPAL;
    const row = await this.prisma.$transaction(async (tx) => {
      const leave = await tx.leaveRequest.create({
        data: {
          schoolId: target.schoolId,
          branchId: target.branchId,
          kind: target.studentId ? 'STUDENT' : 'STAFF',
          studentId: target.studentId,
          staffId: target.staffId,
          sectionId: target.sectionId,
          fromDate: from,
          toDate: to,
          days,
          type: dto.type ?? (target.studentId ? 'OTHER' : 'CASUAL'),
          reason: dto.reason,
          attachmentFileId: dto.attachmentFileId,
          requestedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'LEAVE',
          entityType: 'LeaveRequest',
          entityId: leave.id,
          schoolId: target.schoolId,
          branchId: approver === RoleKey.SUPER_ADMIN ? null : target.branchId,
          requestedById: user.id,
          title: `Leave: ${target.name} ${dto.from} to ${dto.to}`,
          payload: { leaveId: leave.id },
          reason: dto.reason,
          steps: [{ approverRole: approver }],
        },
        tx,
      );
      return tx.leaveRequest.update({
        where: { id: leave.id },
        data: { approvalId: approval.id },
        include: LEAVE_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'leave.request',
      entityType: 'LeaveRequest',
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { from: dto.from, to: dto.to, days, kind: row.kind },
    });
    await this.notifyDeciders(
      row.branchId,
      row.sectionId,
      target.name,
      approver,
    );
    return toLeaveDto(row);
  }

  async cancel(user: AuthUser, id: string): Promise<LeaveDto> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave || leave.requestedById !== user.id) throw notFound('Leave');
    if (leave.status !== 'SUBMITTED')
      throw conflict('Only submitted leave can be cancelled');
    const row = await this.prisma.$transaction(async (tx) => {
      if (leave.approvalId) {
        await tx.approvalRequest.updateMany({
          where: { id: leave.approvalId, status: 'PENDING' },
          data: { status: 'CANCELLED', decidedAt: new Date() },
        });
      }
      return tx.leaveRequest.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: LEAVE_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'leave.cancel',
      entityType: 'LeaveRequest',
      entityId: id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      before: { status: 'SUBMITTED' },
      after: { status: 'CANCELLED' },
    });
    return toLeaveDto(row);
  }

  private async target(user: AuthUser, scope: Scope, dto: CreateLeaveDto) {
    if (dto.studentId) {
      if (!scope.guardian)
        throw forbidden('Student leave is requested by a parent');
      const student = await this.placement.read(scope, dto.studentId);
      return {
        schoolId: student.schoolId,
        branchId: student.branchId,
        sectionId: student.sectionId,
        studentId: student.studentId,
        staffId: null,
        name: student.name,
      };
    }
    const staff = await this.people.staffOfUser(user.id);
    if (!staff || scope.guardian)
      throw invalid('studentId is required for student leave');
    return {
      schoolId: staff.schoolId,
      branchId: staff.branchId,
      sectionId: null,
      studentId: null,
      staffId: staff.id,
      name: staff.name,
    };
  }

  private async assertNoOverlap(
    target: { studentId: string | null; staffId: string | null },
    from: Date,
    to: Date,
  ) {
    const where: Prisma.LeaveRequestWhereInput = {
      studentId: target.studentId,
      staffId: target.staffId,
      status: { in: ['SUBMITTED', 'APPROVED'] },
      fromDate: { lte: to },
      toDate: { gte: from },
    };
    const clash = await this.prisma.leaveRequest.findFirst({ where });
    if (clash) {
      throw conflict(
        `Overlaps leave ${formatDate(clash.fromDate)} to ${formatDate(clash.toDate)}`,
      );
    }
  }

  private async notifyDeciders(
    branchId: string,
    sectionId: string | null,
    name: string,
    approver: RoleKey,
  ) {
    const userIds =
      approver === RoleKey.SUPER_ADMIN
        ? await this.people.superAdmins()
        : [await this.people.principalOf(branchId)];
    if (sectionId) {
      userIds.push((await this.people.classTeacher(sectionId))?.userId ?? null);
    }
    await this.notifications.notify({
      userIds: userIds.filter((id): id is string => !!id),
      category: 'LEAVE',
      title: 'Leave request',
      body: `New leave request for ${name}.`,
    });
  }
}
