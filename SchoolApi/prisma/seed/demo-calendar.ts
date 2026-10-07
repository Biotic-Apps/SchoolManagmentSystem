import type { CalendarEventType } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { addDays, utcToday } from './demo-daily-context';

interface UpcomingEvent {
  title: string;
  type: CalendarEventType;
  description: string;
  /** Days from the seed date. */
  from: number;
  to: number;
}

/** Within the next 90 days so the parent calendar is never empty after a fresh seed. */
const UPCOMING: UpcomingEvent[] = [
  {
    title: 'School holiday',
    type: 'HOLIDAY',
    description: 'School closed for the public holiday.',
    from: 18,
    to: 18,
  },
  {
    title: 'Mid-term exam week',
    type: 'EVENT',
    description: 'Mid-term exams for all classes. Date sheet in the diary.',
    from: 35,
    to: 40,
  },
  {
    title: 'Parent-teacher day',
    type: 'EVENT',
    description:
      'Meet class teachers about the mid-term results, 9:00 to 12:00.',
    from: 55,
    to: 55,
  },
];

/** School-wide calendar events; re-seeding moves them relative to today. */
export async function seedUpcomingCalendar(
  prisma: SeedClient,
  ids: { schoolId: string; sessionId: string },
): Promise<void> {
  const today = utcToday();
  for (const event of UPCOMING) {
    const dates = {
      startDate: addDays(today, event.from),
      endDate: addDays(today, event.to),
    };
    const existing = await prisma.calendarEvent.findFirst({
      where: { schoolId: ids.schoolId, branchId: null, title: event.title },
    });
    if (existing) {
      await prisma.calendarEvent.update({
        where: { id: existing.id },
        data: { ...dates, status: 'ACTIVE' },
      });
      continue;
    }
    await prisma.calendarEvent.create({
      data: {
        schoolId: ids.schoolId,
        sessionId: ids.sessionId,
        type: event.type,
        title: event.title,
        description: event.description,
        ...dates,
      },
    });
  }
}
