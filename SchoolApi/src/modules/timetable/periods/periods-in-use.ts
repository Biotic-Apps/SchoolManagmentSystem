import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DAY_NAMES, layoutOf, type BellRow } from './bell-schedule';

export interface AffectedLessons {
  slotIds: string[];
  /** "Mon P6: Class 9 A English" (unique, sorted by day/period). */
  details: string[];
}

/** (day, index) → true when that period is missing or a break. */
function unusableIn(rows: readonly BellRow[]) {
  const layouts = new Map<number, Map<number, boolean>>();
  return (day: number, index: number) => {
    if (!layouts.has(day)) layouts.set(day, layoutOf(rows, day));
    return layouts.get(day)!.get(index) !== false;
  };
}

/**
 * Lessons (draft or published, open sessions) that a new bell schedule would
 * orphan. Lessons already on a missing period or break stay reported as
 * conflicts and don't block the change.
 */
@Injectable()
export class PeriodsInUse {
  constructor(private readonly prisma: PrismaService) {}

  async find(
    branchId: string,
    current: readonly BellRow[],
    next: readonly BellRow[],
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<AffectedLessons> {
    const slots = await db.timetableSlot.findMany({
      where: {
        timetable: { branchId, session: { status: { not: 'CLOSED' } } },
      },
      select: {
        id: true,
        day: true,
        periodIndex: true,
        subject: { select: { name: true } },
        timetable: {
          select: {
            section: {
              select: { name: true, schoolClass: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: [{ day: 'asc' }, { periodIndex: 'asc' }],
    });
    const unusable = unusableIn(next);
    const wasUnusable = unusableIn(current);
    const hit = slots.filter(
      (s) =>
        unusable(s.day, s.periodIndex) && !wasUnusable(s.day, s.periodIndex),
    );
    const details = [
      ...new Set(
        hit.map((s) => {
          const section = s.timetable.section;
          return `${DAY_NAMES[s.day]} P${s.periodIndex}: ${section.schoolClass.name} ${section.name} ${s.subject.name}`;
        }),
      ),
    ];
    return { slotIds: hit.map((s) => s.id), details };
  }
}
