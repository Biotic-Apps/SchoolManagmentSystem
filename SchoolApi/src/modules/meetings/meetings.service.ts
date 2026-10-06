import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { today } from '../../core/common/week';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isPrincipal, isSuperAdmin } from '../../core/rbac/actor';
import type { Scope } from '../../core/rbac/scope/scope';
import type { MeetingQueryDto } from './dto/meeting-input.dto';
import type { MeetingDto } from './dto/meeting.dto';
import {
  MEETING_INCLUDE,
  toMeetingDto,
  type MeetingRow,
} from './meeting.mapper';

const isLeader = (user: AuthUser) => isPrincipal(user) || isSuperAdmin(user);

/** Meeting lists and detail for participants (principals: their branches). */
@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    user: AuthUser,
    scope: Scope,
    query: MeetingQueryDto,
  ): Promise<PageResult<MeetingDto>> {
    if (query.studentId && scope.guardian) {
      if (!scope.canAccessStudent(query.studentId)) throw notFound('Student');
    }
    const now = today();
    const upcoming = (query.box ?? 'upcoming') === 'upcoming';
    const visible: Prisma.MeetingWhereInput[] = [
      { staffUserId: user.id },
      { guardian: { userId: user.id } },
    ];
    if (isLeader(user)) visible.push(scope.managedBranchFilter());
    const where: Prisma.MeetingWhereInput = {
      AND: [
        { OR: visible },
        { studentId: query.studentId },
        upcoming
          ? { status: 'SCHEDULED', date: { gte: now } }
          : { OR: [{ date: { lt: now } }, { status: { not: 'SCHEDULED' } }] },
      ],
    };
    const order = upcoming ? 'asc' : 'desc';
    const [rows, total] = await Promise.all([
      this.prisma.meeting.findMany({
        where,
        include: MEETING_INCLUDE,
        orderBy: [{ date: order }, { startTime: order }],
        ...toSkipTake(query),
      }),
      this.prisma.meeting.count({ where }),
    ]);
    return toPageResult(
      rows.map((row) => toMeetingDto(row, scope.guardian)),
      total,
      query,
    );
  }

  async get(user: AuthUser, scope: Scope, id: string): Promise<MeetingDto> {
    return toMeetingDto(await this.load(user, scope, id), scope.guardian);
  }

  /** Participants, or a principal / super admin managing the branch. */
  async load(user: AuthUser, scope: Scope, id: string): Promise<MeetingRow> {
    const row = await this.prisma.meeting.findUnique({
      where: { id },
      include: MEETING_INCLUDE,
    });
    if (!row) throw notFound('Meeting');
    const participant =
      row.staffUserId === user.id || row.guardian.userId === user.id;
    const manages =
      isLeader(user) &&
      scope.canManageBranch({ id: row.branchId, schoolId: row.schoolId });
    if (participant || manages) return row;
    throw scope.guardian ? notFound('Meeting') : forbiddenScope();
  }
}
