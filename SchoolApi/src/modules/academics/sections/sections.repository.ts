import { Injectable } from '@nestjs/common';
import type { Prisma, RecordStatus } from '../../../generated/prisma/client';
import { toSkipTake } from '../../../core/common/pagination/paginate';
import { containsInsensitive } from '../../../core/common/search';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { SectionQueryDto } from '../dto/section-query.dto';

const INCLUDE = {
  schoolClass: { select: { name: true, levelOrder: true } },
  room: { select: { id: true, name: true } },
  session: { select: { status: true } },
} satisfies Prisma.SectionInclude;

export type SectionRow = Prisma.SectionGetPayload<{ include: typeof INCLUDE }>;

@Injectable()
export class SectionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: SectionQueryDto) {
    const where: Prisma.SectionWhereInput = {
      AND: [
        scope.global
          ? {}
          : {
              OR: [scope.branchFilter(), { id: { in: [...scope.sectionIds] } }],
            },
        {
          branchId: query.branchId,
          sessionId: query.sessionId,
          classId: query.classId,
          status: (query.status as RecordStatus | undefined) ?? 'ACTIVE',
          name: containsInsensitive(query.search),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.section.findMany({
        where,
        include: INCLUDE,
        orderBy: [{ schoolClass: { levelOrder: 'asc' } }, { name: 'asc' }],
        ...toSkipTake(query),
      }),
      this.prisma.section.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.section.findUnique({ where: { id }, include: INCLUDE });
  }

  findSession(id: string) {
    return this.prisma.academicSession.findUnique({ where: { id } });
  }

  findClass(id: string) {
    return this.prisma.schoolClass.findUnique({ where: { id } });
  }

  findRoom(id: string) {
    return this.prisma.room.findUnique({ where: { id } });
  }

  create(data: Prisma.SectionUncheckedCreateInput) {
    return this.prisma.section.create({ data, include: INCLUDE });
  }

  update(id: string, data: Prisma.SectionUncheckedUpdateInput) {
    return this.prisma.section.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }
}
