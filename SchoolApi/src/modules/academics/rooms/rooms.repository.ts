import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { BranchScopedQueryDto } from '../dto/branch-scoped-query.dto';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: BranchScopedQueryDto) {
    const where: Prisma.RoomWhereInput = {
      AND: [
        scope.branchFilter(),
        {
          branchId: query.branchId,
          status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
          name: containsInsensitive(query.search),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.room.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.room.findUnique({ where: { id } });
  }

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
  }

  create(data: Prisma.RoomUncheckedCreateInput) {
    return this.prisma.room.create({ data });
  }

  update(id: string, data: Prisma.RoomUncheckedUpdateInput) {
    return this.prisma.room.update({ where: { id }, data });
  }
}
