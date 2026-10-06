import { Injectable } from '@nestjs/common';
import type { ApplicationStatus, Prisma } from '../../generated/prisma/client';
import { toSkipTake } from '../../core/common/pagination/paginate';
import { containsInsensitive } from '../../core/common/search';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import type {
  ApplicationQueryDto,
  WaitlistQueryDto,
} from './dto/application-input.dto';

export const APPLICATION_INCLUDE = {
  schoolClass: { select: { name: true } },
  test: true,
} satisfies Prisma.AdmissionApplicationInclude;

export type ApplicationRow = Prisma.AdmissionApplicationGetPayload<{
  include: typeof APPLICATION_INCLUDE;
}>;

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(scope: Scope, query: ApplicationQueryDto) {
    const search = containsInsensitive(query.search);
    const where: Prisma.AdmissionApplicationWhereInput = {
      AND: [
        scope.managedBranchFilter(),
        {
          branchId: query.branchId,
          sessionId: query.sessionId,
          classId: query.classId,
          status: query.status as ApplicationStatus | undefined,
        },
        search
          ? { OR: [{ childName: search }, { applicationNo: search }] }
          : {},
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.admissionApplication.findMany({
        where,
        include: APPLICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(query),
      }),
      this.prisma.admissionApplication.count({ where }),
    ]);
    return { rows, total };
  }

  waitlist(scope: Scope, query: WaitlistQueryDto) {
    return this.prisma.admissionApplication.findMany({
      where: {
        AND: [
          scope.managedBranchFilter(),
          {
            status: 'WAITLISTED',
            branchId: query.branchId,
            sessionId: query.sessionId,
            classId: query.classId,
          },
        ],
      },
      include: APPLICATION_INCLUDE,
      orderBy: [{ classId: 'asc' }, { waitlistPosition: 'asc' }],
      take: 500,
    });
  }

  findById(id: string) {
    return this.prisma.admissionApplication.findUnique({
      where: { id },
      include: APPLICATION_INCLUDE,
    });
  }

  update(id: string, data: Prisma.AdmissionApplicationUncheckedUpdateInput) {
    return this.prisma.admissionApplication.update({
      where: { id },
      data,
      include: APPLICATION_INCLUDE,
    });
  }
}
