import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class TermsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listBySession(sessionId: string) {
    return this.prisma.term.findMany({
      where: { sessionId },
      orderBy: { startDate: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.term.findUnique({
      where: { id },
      include: { session: true },
    });
  }

  /** Terms of the session whose dates intersect [start, end]. */
  overlapping(sessionId: string, start: Date, end: Date, exceptId?: string) {
    return this.prisma.term.findFirst({
      where: {
        sessionId,
        id: exceptId ? { not: exceptId } : undefined,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });
  }

  nextSortOrder(sessionId: string) {
    return this.prisma.term
      .count({ where: { sessionId } })
      .then((count) => count + 1);
  }

  create(data: Prisma.TermUncheckedCreateInput) {
    return this.prisma.term.create({ data });
  }

  update(id: string, data: Prisma.TermUncheckedUpdateInput) {
    return this.prisma.term.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.term.delete({ where: { id } });
  }
}
