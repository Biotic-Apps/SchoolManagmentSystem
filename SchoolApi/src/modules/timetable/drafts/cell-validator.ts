import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { domainError } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DAY_NAMES, layoutOf } from '../periods/bell-schedule';
import type { SectionContext } from '../timetable-context.service';

export interface CellInput {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId: string | null;
}

const distinct = (values: (string | null)[]) => [
  ...new Set(values.filter((v): v is string => !!v)),
];

/** Lesson checks (contract §5.5): strict for one autosaved cell, lighter for bulk drafts. */
@Injectable()
export class CellValidator {
  constructor(private readonly prisma: PrismaService) {}

  /** Working day, period on that day's schedule, not a break. */
  assertPlacement(ctx: SectionContext, day: number, periodIndex: number) {
    if (!ctx.workingDays.includes(day))
      throw domainError(
        ErrorCode.NON_WORKING_DAY,
        `${DAY_NAMES[day] ?? day} is not a working day`,
      );
    this.assertPeriodExists(ctx, day, periodIndex);
    if (layoutOf(ctx.bell, day).get(periodIndex))
      throw domainError(
        ErrorCode.BREAK_PERIOD,
        `Period ${periodIndex} is a break`,
      );
  }

  async assert(ctx: SectionContext, cell: CellInput): Promise<void> {
    this.assertPlacement(ctx, cell.day, cell.periodIndex);
    await this.assertRefs(ctx, [cell]);
  }

  /** Bulk drafts: breaks and non-working days stay conflicts, everything else must be valid. */
  async assertMany(ctx: SectionContext, cells: CellInput[]): Promise<void> {
    for (const cell of cells)
      this.assertPeriodExists(ctx, cell.day, cell.periodIndex);
    await this.assertRefs(ctx, cells);
  }

  private assertPeriodExists(
    ctx: SectionContext,
    day: number,
    periodIndex: number,
  ) {
    if (!layoutOf(ctx.bell, day).has(periodIndex))
      throw domainError(
        ErrorCode.PERIOD_NOT_ON_DAY,
        `Period ${periodIndex} is not in ${DAY_NAMES[day] ?? day}'s bell schedule`,
      );
  }

  private async assertRefs(
    ctx: SectionContext,
    cells: CellInput[],
  ): Promise<void> {
    const taught = new Set(ctx.curriculum.map((cs) => cs.subjectId));
    if (cells.some((c) => !taught.has(c.subjectId))) {
      const group = ctx.section.group ? ` (${ctx.section.group})` : '';
      throw domainError(
        ErrorCode.SUBJECT_NOT_IN_CLASS,
        `Subject is not taught in ${ctx.className}${group}`,
      );
    }
    const { schoolId, branchId } = ctx.section;
    const staffIds = distinct(cells.map((c) => c.staffId));
    const roomIds = distinct(cells.map((c) => c.roomId));
    const [staff, rooms] = await Promise.all([
      this.prisma.staff.count({
        where: { id: { in: staffIds }, schoolId, status: 'ACTIVE' },
      }),
      roomIds.length > 0
        ? this.prisma.room.count({
            where: { id: { in: roomIds }, branchId, status: 'ACTIVE' },
          })
        : Promise.resolve(0),
    ]);
    if (staff !== staffIds.length)
      throw domainError(
        ErrorCode.UNKNOWN_STAFF,
        'Teacher must be an active staff member of the school',
      );
    if (rooms !== roomIds.length)
      throw domainError(ErrorCode.UNKNOWN_ROOM, 'Room is not in this branch');
  }
}
