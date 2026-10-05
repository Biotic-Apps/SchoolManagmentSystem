import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import type { ListQueryDto } from '../../core/common/pagination/list-query.dto';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';

const INCLUDE = {
  _count: { select: { branches: { where: { status: 'ACTIVE' } } } },
} satisfies Prisma.SchoolInclude;

export type SchoolRow = Prisma.SchoolGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class SchoolsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: ListQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.SchoolWhereInput = {
      ...(scope.global ? {} : { id: { in: [...scope.memberSchoolIds] } }),
      status: query.status as RecordStatus | undefined,
      ...(search && { OR: [{ name: search }, { code: search }] }),
    };
    const [rows, total] = await Promise.all([
      this.prisma.school.findMany({
        where,
        include: INCLUDE,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.school.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.school.findUnique({ where: { id }, include: INCLUDE });
  }

  create(data: Prisma.SchoolUncheckedCreateInput) {
    return this.prisma.school.create({ data, include: INCLUDE });
  }

  update(id: string, data: Prisma.SchoolUncheckedUpdateInput) {
    return this.prisma.school.update({ where: { id }, data, include: INCLUDE });
  }

  logoFile(id: string) {
    return this.prisma.file.findFirst({
      where: { id, archivedAt: null, purpose: 'SCHOOL_LOGO' },
    });
  }
}
