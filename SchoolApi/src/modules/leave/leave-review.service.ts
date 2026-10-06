import { Injectable } from '@nestjs/common';
import type { LeaveRequest, Prisma } from '../../generated/prisma/client';
import { ApprovalService } from '../../core/approvals/approval.service';
import { conflict, forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrincipal, isSuperAdmin } from '../../core/rbac/actor';
import type { Scope } from '../../core/rbac/scope/scope';
import type { LeaveDto, LeaveQueryDto } from './dto/leave.dto';
import { LEAVE_INCLUDE, toLeaveDto } from './leave.mapper';

/**
 * Deciders (contract §3): student leave → class teacher or principal; staff
 * leave → principal; the principal's own leave → super admin.
 */
@Injectable()
export class LeaveReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: LeaveQueryDto,
  ): Promise<LeaveDto[]> {
    const filter: Prisma.LeaveRequestWhereInput = {
      branchId: query.branchId,
      status: query.status,
    };
    const where: Prisma.LeaveRequestWhereInput =
      query.scope === 'review'
        ? { AND: [filter, await this.decidable(user, scope)] }
        : { ...filter, requestedById: user.id };
    const rows = await this.prisma.leaveRequest.findMany({
      where,
      include: LEAVE_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map(toLeaveDto);
  }

  async decide(
    user: AuthUser,
    scope: Scope,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string,
  ): Promise<LeaveDto> {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw notFound('Leave');
    if (!(await this.canDecide(user, scope, leave)))
      throw forbidden('You cannot decide this leave');
    if (leave.status !== 'SUBMITTED' || !leave.approvalId)
      throw conflict('Leave is no longer pending');
    await this.approvals.decideAuthorized(user.id, leave.approvalId, {
      decision,
      comment,
    });
    const row = await this.prisma.leaveRequest.findUniqueOrThrow({
      where: { id },
      include: LEAVE_INCLUDE,
    });
    return toLeaveDto(row);
  }

  private async canDecide(
    user: AuthUser,
    scope: Scope,
    leave: LeaveRequest,
  ): Promise<boolean> {
    if (leave.requestedById === user.id) return false;
    if (isSuperAdmin(user)) return true;
    const branch = { id: leave.branchId, schoolId: leave.schoolId };
    if (isPrincipal(user) && scope.canManageBranch(branch)) {
      if (leave.kind === 'STUDENT') return true;
      const staff = await this.prisma.staff.findUnique({
        where: { id: leave.staffId! },
        select: { userId: true },
      });
      const principal = await this.prisma.branch.findUnique({
        where: { id: leave.branchId },
        select: { principalUserId: true },
      });
      return staff?.userId !== principal?.principalUserId;
    }
    if (leave.kind !== 'STUDENT' || !leave.sectionId) return false;
    const section = await this.prisma.section.findUnique({
      where: { id: leave.sectionId },
      select: { classTeacher: { select: { userId: true } } },
    });
    return section?.classTeacher?.userId === user.id;
  }

  private async decidable(
    user: AuthUser,
    scope: Scope,
  ): Promise<Prisma.LeaveRequestWhereInput> {
    const notOwn = { requestedById: { not: user.id } };
    if (isSuperAdmin(user)) return notOwn;
    if (isPrincipal(user)) {
      return { AND: [notOwn, scope.managedBranchFilter()] };
    }
    const sections = await this.prisma.section.findMany({
      where: { classTeacher: { userId: user.id } },
      select: { id: true },
    });
    return {
      ...notOwn,
      kind: 'STUDENT',
      sectionId: { in: sections.map((s) => s.id) },
    };
  }
}
