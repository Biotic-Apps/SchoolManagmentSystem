import { Injectable } from '@nestjs/common';
import type {
  AcademicSessionStatus,
  Prisma,
} from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type { SessionQueryDto } from './dto/session-query.dto';

const INCLUDE = {
  _count: { select: { terms: true } },
} satisfies Prisma.AcademicSessionInclude;

export type SessionRow = Prisma.AcademicSessionGetPayload<{
  include: typeof INCLUDE;
}>;

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: SessionQueryDto) {
    const where: Prisma.AcademicSessionWhereInput = {
      AND: [
        scope.branchFilter(),
        {
          branchId: query.branchId,
          status: query.status as AcademicSessionStatus | undefined,
          name: containsInsensitive(query.search),
        },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.academicSession.findMany({
        where,
        include: INCLUDE,
        orderBy: { startDate: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.academicSession.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.academicSession.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true, status: true },
    });
  }

  activeInBranch(branchId: string) {
    return this.prisma.academicSession.findFirst({
      where: { branchId, status: 'ACTIVE' },
    });
  }

  create(
    data: Prisma.AcademicSessionUncheckedCreateInput,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    return db.academicSession.create({ data, include: INCLUDE });
  }

  update(id: string, data: Prisma.AcademicSessionUncheckedUpdateInput) {
    return this.prisma.academicSession.update({
      where: { id },
      data,
      include: INCLUDE,
    });
  }
}
