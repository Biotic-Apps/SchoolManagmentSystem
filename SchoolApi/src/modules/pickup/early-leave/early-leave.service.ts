import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { ApprovalService } from '../../../core/approvals/approval.service';
import { AuditService } from '../../../core/audit/audit.service';
import { parseDate } from '../../../core/common/dates';
import {
  conflict,
  forbiddenScope,
  invalid,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import type { Scope } from '../../../core/rbac/scope/scope';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { StudentPlacementService } from '../../school-day/student-placement.service';
import type {
  CreateEarlyLeaveDto,
  EarlyLeaveDto,
  EarlyLeaveQueryDto,
} from '../dto/pickup.dto';
import { EARLY_LEAVE_ENTITY } from './early-leave-approval.handler';
import { EARLY_LEAVE_INCLUDE, EarlyLeaveMapper } from './early-leave.mapper';

/** Contract §11: early-leave requests decided by class teacher or principal. */
@Injectable()
export class EarlyLeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly placements: StudentPlacementService,
    private readonly people: SchoolPeopleService,
    private readonly approvals: ApprovalService,
    private readonly notifications: NotificationService,
    private readonly audit: AuditService,
    private readonly mapper: EarlyLeaveMapper,
  ) {}

  async request(
    user: AuthUser,
    scope: Scope,
    dto: CreateEarlyLeaveDto,
  ): Promise<EarlyLeaveDto> {
    const placement = await this.placements.read(scope, dto.studentId);
    if (dto.pickupPersonId) {
      const person = await this.prisma.pickupPerson.findUnique({
        where: { id: dto.pickupPersonId },
      });
      if (person?.studentId !== dto.studentId || person.status !== 'VERIFIED')
        throw invalid('Pickup person must be verified for this student');
    }
    const date = parseDate(dto.date);
    const open = await this.prisma.earlyLeave.count({
      where: {
        studentId: dto.studentId,
        date,
        status: { in: ['REQUESTED', 'APPROVED'] },
      },
    });
    if (open > 0) throw conflict('An early leave is already open for this day');

    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.earlyLeave.create({
        data: {
          schoolId: placement.schoolId,
          branchId: placement.branchId,
          sectionId: placement.sectionId,
          studentId: dto.studentId,
          date,
          time: dto.time,
          reason: dto.reason,
          pickupPersonId: dto.pickupPersonId ?? null,
          requestedById: user.id,
        },
      });
      const approval = await this.approvals.create(
        {
          type: 'EARLY_LEAVE',
          entityType: EARLY_LEAVE_ENTITY,
          entityId: created.id,
          schoolId: placement.schoolId,
          branchId: placement.branchId,
          requestedById: user.id,
          title: `Early leave: ${placement.name} ${dto.date} ${dto.time}`,
          payload: { studentId: dto.studentId, date: dto.date, time: dto.time },
          reason: dto.reason,
          steps: [{ approverRole: RoleKey.PRINCIPAL }],
        },
        tx,
      );
      return tx.earlyLeave.update({
        where: { id: created.id },
        data: { approvalId: approval.id },
        include: EARLY_LEAVE_INCLUDE,
      });
    });
    this.audit.stage({
      action: 'pickup.early_leave_request',
      entityType: EARLY_LEAVE_ENTITY,
      entityId: row.id,
      schoolId: row.schoolId,
      branchId: row.branchId,
      after: { studentId: row.studentId, date: dto.date, time: row.time },
    });
    const [teacher, principal] = await Promise.all([
      this.people.classTeacher(row.sectionId),
      this.people.principalOf(row.branchId),
    ]);
    await this.notifications.notify({
      userIds: [teacher?.userId, principal].filter(
        (id): id is string => !!id && id !== user.id,
      ),
      category: 'PICKUP',
      title: `Early leave request: ${placement.name}`,
      body: `${dto.date} ${dto.time}: ${dto.reason}`,
      data: { earlyLeaveId: row.id, studentId: row.studentId },
    });
    return this.mapper.toDto(row);
  }

  async list(
    scope: Scope,
    query: EarlyLeaveQueryDto,
  ): Promise<EarlyLeaveDto[]> {
    const scopeFilter = scope.guardian
      ? { studentId: { in: [...scope.studentIds] } }
      : scope.sectionFilter();
    const where: Prisma.EarlyLeaveWhereInput = {
      AND: [scopeFilter, query.studentId ? { studentId: query.studentId } : {}],
      branchId: query.branchId,
      date: query.date ? parseDate(query.date) : undefined,
      status: query.status,
    };
    const rows = await this.prisma.earlyLeave.findMany({
      where,
      include: EARLY_LEAVE_INCLUDE,
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });
    return this.mapper.toDtos(rows);
  }

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string,
  ): Promise<EarlyLeaveDto> {
    const leave = await this.prisma.earlyLeave.findUnique({ where: { id } });
    if (!leave || (scope.guardian && !scope.canAccessStudent(leave.studentId)))
      throw notFound('Early leave');
    const allowed =
      scope.classSectionIds.has(leave.sectionId) ||
      scope.canManageBranch({ id: leave.branchId, schoolId: leave.schoolId });
    if (!allowed) throw forbiddenScope();
    if (leave.status !== 'REQUESTED' || !leave.approvalId)
      throw conflict('Early leave is no longer awaiting a decision');
    await this.approvals.decideAuthorized(user.id, leave.approvalId, {
      decision,
      comment,
    });
    const row = await this.prisma.earlyLeave.findUniqueOrThrow({
      where: { id },
      include: EARLY_LEAVE_INCLUDE,
    });
    return this.mapper.toDto(row);
  }
}
