import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { TransferQueryDto } from './dto/transfer-input.dto';

export const TRANSFER_INCLUDE = {
  student: {
    select: { id: true, firstName: true, lastName: true, admissionNo: true },
  },
  fromBranch: {
    select: { id: true, name: true, schoolId: true, principalUserId: true },
  },
  toBranch: {
    select: { id: true, name: true, schoolId: true, principalUserId: true },
  },
} satisfies Prisma.TransferInclude;

export type TransferRow = Prisma.TransferGetPayload<{
  include: typeof TRANSFER_INCLUDE;
}>;

@Injectable()
export class TransfersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: TransferQueryDto) {
    const managed = (field: 'fromBranchId' | 'toBranchId') =>
      scope.global
        ? {}
        : {
            OR: [
              { schoolId: { in: [...scope.schoolIds] } },
              { [field]: { in: [...scope.branchIds] } },
            ],
          };
    const visible: Prisma.TransferWhereInput =
      query.direction === 'IN'
        ? managed('toBranchId')
        : query.direction === 'OUT'
          ? managed('fromBranchId')
          : { OR: [managed('toBranchId'), managed('fromBranchId')] };
    const branch: Prisma.TransferWhereInput = query.branchId
      ? query.direction === 'IN'
        ? { toBranchId: query.branchId }
        : query.direction === 'OUT'
          ? { fromBranchId: query.branchId }
          : {
              OR: [
                { toBranchId: query.branchId },
                { fromBranchId: query.branchId },
              ],
            }
      : {};
    const where: Prisma.TransferWhereInput = {
      AND: [visible, branch, { status: query.status }],
    };
    const [rows, total] = await Promise.all([
      this.prisma.transfer.findMany({
        where,
        include: TRANSFER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.transfer.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.transfer.findUnique({
      where: { id },
      include: TRANSFER_INCLUDE,
    });
  }

  findBranch(id: string) {
    return this.prisma.branch.findUnique({ where: { id } });
  }
}
