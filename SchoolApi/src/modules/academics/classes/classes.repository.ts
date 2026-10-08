import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { SchoolQueryDto } from '../dto/school-query.dto';

const INCLUDE = {
  _count: { select: { subjects: { where: { status: 'ACTIVE' } } } },
} satisfies Prisma.SchoolClassInclude;

export type ClassRow = Prisma.SchoolClassGetPayload<{
  include: typeof INCLUDE;
}>;

@Injectable()
export class ClassesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: SchoolQueryDto) {
    const where: Prisma.SchoolClassWhereInput = {
      AND: [
        scope.schoolFilter(),
        {
          schoolId: query.schoolId,
          status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
          name: containsInsensitive(query.search),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.schoolClass.findMany({
        where,
        include: INCLUDE,
        orderBy: { levelOrder: 'asc' },
        ...toSkipTake(query),
      }),
      this.prisma.schoolClass.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.schoolClass.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  create(
    data: Prisma.SchoolClassUncheckedCreateInput,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    return db.schoolClass.create({ data, include: INCLUDE });
  }

  update(id: string, data: Prisma.SchoolClassUncheckedUpdateInput) {
    return this.prisma.schoolClass.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }

  async subjectsOf(classId: string) {
    const links = await this.prisma.classSubject.findMany({
      where: { classId, status: 'ACTIVE', subject: { status: 'ACTIVE' } },
      include: { subject: true },
      orderBy: [{ sortOrder: 'asc' }, { subject: { name: 'asc' } }],
    });
    return links.map((l) => l.subject);
  }
}
