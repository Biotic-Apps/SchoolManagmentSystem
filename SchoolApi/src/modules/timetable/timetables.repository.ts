import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

export const SLOT_INCLUDE = {
  subject: { select: { id: true, name: true } },
  staff: { select: { id: true, name: true, userId: true } },
  room: { select: { id: true, name: true } },
} satisfies Prisma.TimetableSlotInclude;

export type SlotRow = Prisma.TimetableSlotGetPayload<{
  include: typeof SLOT_INCLUDE;
}>;

@Injectable()
export class TimetablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(sectionId: string, sessionId: string) {
    return this.prisma.timetable.findUnique({
      where: { sectionId_sessionId: { sectionId, sessionId } },
    });
  }

  slots(timetableId: string, published: boolean) {
    return this.prisma.timetableSlot.findMany({
      where: { timetableId, published },
      include: SLOT_INCLUDE,
      orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
    });
  }

  /** Published slots of other sections in the session (conflict input). */
  othersPublished(sessionId: string, sectionId: string) {
    return this.prisma.timetableSlot.findMany({
      where: {
        published: true,
        timetable: { sessionId, sectionId: { not: sectionId } },
      },
      include: { timetable: { select: { sectionId: true } } },
    });
  }

  teachingAssignments(sectionId: string) {
    return this.prisma.staffAssignment.findMany({
      where: {
        sectionId,
        endedAt: null,
        kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
      },
      select: { staffId: true, subjectId: true, kind: true },
    });
  }
}
