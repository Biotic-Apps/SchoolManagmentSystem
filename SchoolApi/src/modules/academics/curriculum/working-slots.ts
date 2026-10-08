import type { Prisma } from '../../../generated/prisma/client';

/**
 * Lessons being planned: the draft of timetables with unpublished changes, or
 * the published week when nothing changed since publishing ("placed" counts).
 */
export const workingSlotWhere = (): Prisma.TimetableSlotWhereInput => ({
  OR: [
    { published: false, timetable: { status: { not: 'PUBLISHED' } } },
    { published: true, timetable: { status: 'PUBLISHED' } },
  ],
});
