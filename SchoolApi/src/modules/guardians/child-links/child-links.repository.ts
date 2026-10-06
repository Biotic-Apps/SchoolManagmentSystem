import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { ChildLinkQueryDto } from './child-link.dto';

export const CHILD_LINK_INCLUDE = {
  guardian: { select: { id: true, name: true, phone: true, userId: true } },
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      admissionNo: true,
      enrollments: {
        include: {
          section: {
            select: { name: true, schoolClass: { select: { name: true } } },
          },
        },
        orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      },
    },
  },
} satisfies Prisma.ChildLinkRequestInclude;

export type ChildLinkRow = Prisma.ChildLinkRequestGetPayload<{
  include: typeof CHILD_LINK_INCLUDE;
}>;

@Injectable()
export class ChildLinksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: ChildLinkQueryDto) {
    const where: Prisma.ChildLinkRequestWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        { status: query.status ?? 'REQUESTED', branchId: query.branchId },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.childLinkRequest.findMany({
        where,
        include: CHILD_LINK_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.childLinkRequest.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.childLinkRequest.findUnique({
      where: { id },
      include: CHILD_LINK_INCLUDE,
    });
  }
}
