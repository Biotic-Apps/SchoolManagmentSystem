import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { AuditService } from '../../../core/audit/audit.service';
import {
  conflict,
  forbiddenScope,
  notFound,
} from '../../../core/common/errors/errors';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { isPrincipal, isSuperAdmin } from '../../../core/rbac/actor';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { FollowUpQueryDto } from '../dto/meeting-input.dto';
import type { FollowUpDto } from '../dto/meeting.dto';
import { FOLLOW_UP_INCLUDE, toFollowUpDto } from '../meeting.mapper';

/** Meeting follow-up tasks: owners list and complete their own. */
@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: FollowUpQueryDto,
  ): Promise<FollowUpDto[]> {
    let owner: Prisma.MeetingFollowUpWhereInput = { ownerUserId: user.id };
    if (query.mine === 'false') {
      if (!isPrincipal(user) && !isSuperAdmin(user)) throw forbiddenScope();
      owner = { meeting: scope.managedBranchFilter() };
    }
    const rows = await this.prisma.meetingFollowUp.findMany({
      where: { AND: [owner, { status: query.status }] },
      include: FOLLOW_UP_INCLUDE,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      take: 200,
    });
    return rows.map(toFollowUpDto);
  }

  async done(user: AuthUser, id: string): Promise<FollowUpDto> {
    const row = await this.prisma.meetingFollowUp.findUnique({
      where: { id },
      include: { meeting: { select: { schoolId: true, branchId: true } } },
    });
    if (!row || row.ownerUserId !== user.id) throw notFound('Follow-up');
    const claimed = await this.prisma.meetingFollowUp.updateMany({
      where: { id, status: 'OPEN' },
      data: { status: 'DONE', doneAt: new Date() },
    });
    if (claimed.count === 0) throw conflict('Follow-up is already done');
    this.audit.stage({
      action: 'meetings.followUp.done',
      entityType: 'MeetingFollowUp',
      entityId: id,
      schoolId: row.meeting.schoolId,
      branchId: row.meeting.branchId,
      before: { status: row.status },
      after: { status: 'DONE' },
    });
    const updated = await this.prisma.meetingFollowUp.findUniqueOrThrow({
      where: { id },
      include: FOLLOW_UP_INCLUDE,
    });
    return toFollowUpDto(updated);
  }
}
