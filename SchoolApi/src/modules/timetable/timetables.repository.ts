import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { BusySlot } from './conflicts/conflict-types';

export const SLOT_INCLUDE = {
  subject: { select: { id: true, name: true } },
  staff: { select: { id: true, name: true, userId: true } },
  room: { select: { id: true, name: true } },
} satisfies Prisma.TimetableSlotInclude;

export type SlotRow = Prisma.TimetableSlotGetPayload<{
  include: typeof SLOT_INCLUDE;
}>;

type Db = Prisma.TransactionClient;

@Injectable()
export class TimetablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(sectionId: string, sessionId: string, db: Db = this.prisma) {
    return db.timetable.findUnique({
      where: { sectionId_sessionId: { sectionId, sessionId } },
    });
  }

  slots(timetableId: string, published: boolean, db: Db = this.prisma) {
    return db.timetableSlot.findMany({
      where: { timetableId, published },
      include: SLOT_INCLUDE,
      orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
    });
  }

  async counts(timetableId: string) {
    const rows = await this.prisma.timetableSlot.groupBy({
      by: ['published'],
      where: { timetableId },
      _count: { _all: true },
    });
    const of = (published: boolean) =>
      rows.find((r) => r.published === published)?._count._all ?? 0;
    return { draft: of(false), published: of(true) };
  }

  /**
   * Other sections of the session: published slots, and draft slots of
   * timetables whose draft differs from what is published.
   */
  async others(
    sessionId: string,
    sectionId: string,
    db: Db = this.prisma,
  ): Promise<{ published: BusySlot[]; drafts: BusySlot[] }> {
    const rows = await db.timetableSlot.findMany({
      where: {
        timetable: { sessionId, sectionId: { not: sectionId } },
        OR: [
          { published: true },
          { timetable: { status: { not: 'PUBLISHED' } } },
        ],
      },
      select: {
        day: true,
        periodIndex: true,
        subjectId: true,
        staffId: true,
        roomId: true,
        published: true,
        timetable: {
          select: {
            sectionId: true,
            section: {
              select: { name: true, schoolClass: { select: { name: true } } },
            },
          },
        },
      },
    });
    const toBusy = (r: (typeof rows)[number]): BusySlot => ({
      day: r.day,
      periodIndex: r.periodIndex,
      subjectId: r.subjectId,
      staffId: r.staffId,
      roomId: r.roomId,
      sectionId: r.timetable.sectionId,
      sectionName: `${r.timetable.section.schoolClass.name} ${r.timetable.section.name}`,
    });
    return {
      published: rows.filter((r) => r.published).map(toBusy),
      drafts: rows.filter((r) => !r.published).map(toBusy),
    };
  }

  teachingAssignments(sectionId: string, db: Db = this.prisma) {
    return db.staffAssignment.findMany({
      where: {
        sectionId,
        endedAt: null,
        kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
      },
      select: {
        id: true,
        staffId: true,
        subjectId: true,
        kind: true,
        isSubstitute: true,
        staff: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  classSubjects(classId: string) {
    return this.prisma.classSubject.findMany({
      where: { classId, status: 'ACTIVE', subject: { status: 'ACTIVE' } },
      include: { subject: { select: { id: true, name: true, code: true } } },
      orderBy: [{ sortOrder: 'asc' }, { subject: { name: 'asc' } }],
    });
  }

  rooms(branchId: string) {
    return this.prisma.room.findMany({
      where: { branchId, status: 'ACTIVE' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
