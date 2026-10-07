import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { BranchQueryDto } from './dto/branch-query.dto';

const INCLUDE = {
  school: { select: { name: true } },
  principal: { select: { id: true, name: true } },
} satisfies Prisma.BranchInclude;

export type BranchRow = Prisma.BranchGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class BranchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: BranchQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.BranchWhereInput = {
      AND: [
        scope.branchTableFilter(),
        {
          schoolId: query.schoolId,
          status: query.status as RecordStatus | undefined,
          ...(search && { OR: [{ name: search }, { code: search }] }),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        include: INCLUDE,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.branch.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.branch.findUnique({ where: { id }, include: INCLUDE });
  }

  schoolExists(id: string) {
    return this.prisma.school.count({ where: { id } });
  }

  create(
    data: Prisma.BranchUncheckedCreateInput,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    return db.branch.create({ data, include: INCLUDE });
  }

  update(id: string, data: Prisma.BranchUncheckedUpdateInput) {
    return this.prisma.branch.update({ where: { id }, data, include: INCLUDE });
  }
}
