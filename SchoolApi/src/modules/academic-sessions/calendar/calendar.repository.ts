import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';

const MAX_EVENTS = 500;

export interface CalendarFilter {
  branch?: { id: string; schoolId: string };
  from?: Date;
  to?: Date;
}

@Injectable()
export class CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Branch events plus whole-school events of schools the user belongs to. */
  list(scope: Scope, filter: CalendarFilter) {
    const visible: Prisma.CalendarEventWhereInput = {
      OR: [
        { AND: [{ branchId: { not: null } }, scope.branchFilter()] },
        { AND: [{ branchId: null }, scope.schoolFilter()] },
      ],
    };
    const place: Prisma.CalendarEventWhereInput = filter.branch
      ? {
          schoolId: filter.branch.schoolId,
          OR: [{ branchId: filter.branch.id }, { branchId: null }],
        }
      : {};
    return this.prisma.calendarEvent.findMany({
      where: {
        AND: [visible, place],
        status: 'ACTIVE',
        endDate: filter.from ? { gte: filter.from } : undefined,
        startDate: filter.to ? { lte: filter.to } : undefined,
      },
      orderBy: { startDate: 'asc' },
      take: MAX_EVENTS,
    });
  }

  /** Events of one branch plus its school's whole-school events (caller already checked access). */
  listForBranch(
    branch: { id: string; schoolId: string },
    from: Date,
    to: Date,
  ) {
    return this.prisma.calendarEvent.findMany({
      where: {
        schoolId: branch.schoolId,
        OR: [{ branchId: branch.id }, { branchId: null }],
        status: 'ACTIVE',
        endDate: { gte: from },
        startDate: { lte: to },
      },
      orderBy: { startDate: 'asc' },
      take: MAX_EVENTS,
    });
  }

  findById(id: string) {
    return this.prisma.calendarEvent.findFirst({
      where: { id, status: 'ACTIVE' },
    });
  }

  findBranch(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
      select: { id: true, schoolId: true },
    });
  }

  create(data: Prisma.CalendarEventUncheckedCreateInput) {
    return this.prisma.calendarEvent.create({ data });
  }

  update(id: string, data: Prisma.CalendarEventUncheckedUpdateInput) {
    return this.prisma.calendarEvent.update({ where: { id }, data });
  }
}
