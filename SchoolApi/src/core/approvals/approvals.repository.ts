import { Injectable } from '@nestjs/common';
import type {
  ApprovalStatus,
  ApprovalType,
  Prisma,
} from '../../generated/prisma/client';
import { toSkipTake } from '../common/pagination/paginate';
import type { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Scope } from '../rbac/scope/scope';

export interface InboxFilter {
  userId: string;
  activeRole: string;
  status?: ApprovalStatus;
  type?: ApprovalType;
}

const INCLUDE = {
  requestedBy: { select: { id: true, name: true } },
  steps: {
    orderBy: { order: 'asc' },
    include: { decidedBy: { select: { id: true, name: true } } },
  },
} satisfies Prisma.ApprovalRequestInclude;

@Injectable()
export class ApprovalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Requests the user raised, or where an undecided step awaits them. */
  inboxWhere(
    scope: Scope,
    filter: InboxFilter,
  ): Prisma.ApprovalRequestWhereInput {
    return {
      status: filter.status,
      type: filter.type,
      OR: [
        { requestedById: filter.userId },
        { steps: { some: { decision: null, approverUserId: filter.userId } } },
        {
          AND: [
            scope.branchFilter(),
            {
              steps: {
                some: {
                  decision: null,
                  approverUserId: null,
                  approverRole: filter.activeRole,
                },
              },
            },
          ],
        },
      ],
    };
  }

  async list(scope: Scope, filter: InboxFilter, page: PaginationQueryDto) {
    const where = this.inboxWhere(scope, filter);
    const [rows, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        include: INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(page),
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);
    return { rows, total };
  }

  countPending(
    scope: Scope,
    userId: string,
    activeRole: string,
  ): Promise<number> {
    return this.prisma.approvalRequest.count({
      where: {
        AND: [
          this.inboxWhere(scope, { userId, activeRole, status: 'PENDING' }),
          { requestedById: { not: userId } },
        ],
      },
    });
  }

  findById(id: string) {
    return this.prisma.approvalRequest.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  /** Moves undecided steps of pending requests in a branch to another user. */
  reassignPending(branchId: string, fromUserId: string, toUserId: string) {
    return this.prisma.approvalStep.updateMany({
      where: {
        approverUserId: fromUserId,
        decision: null,
        request: { branchId, status: 'PENDING' },
      },
      data: { approverUserId: toUserId },
    });
  }
}

export type ApprovalWithSteps = NonNullable<
  Awaited<ReturnType<ApprovalsRepository['findById']>>
>;
