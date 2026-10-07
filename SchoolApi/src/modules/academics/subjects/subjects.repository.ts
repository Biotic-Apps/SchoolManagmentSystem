import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { SchoolQueryDto } from '../dto/school-query.dto';

@Injectable()
export class SubjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: SchoolQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.SubjectWhereInput = {
      AND: [
        scope.schoolFilter(),
        {
          schoolId: query.schoolId,
          status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
          ...(search && { OR: [{ name: search }, { code: search }] }),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy: { name: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.subject.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  create(
    data: Prisma.SubjectUncheckedCreateInput,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    return db.subject.create({ data });
  }

  update(id: string, data: Prisma.SubjectUncheckedUpdateInput) {
    return this.prisma.subject.update({ where: { id }, data });
  }
}
