import type { SeedClient } from './client';
import { addDays, type DailyContext, userId } from './demo-daily-context';

const TIMES = [
  ['13:30', '13:45'],
  ['13:45', '14:00'],
  ['14:00', '14:15'],
];

/** teacher@ slots on the next school days of this week; one booked by parent@. */
export async function seedMeetings(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const staffUserId = userId(ctx, 'teacher@eschool.local');
  const dates = [1, 2, 3]
    .map((n) => addDays(ctx.today, n))
    .filter((d) => d.getUTCDay() !== 0);
  let first: string | null = null;
  for (const date of dates) {
    for (const [startTime, endTime] of TIMES) {
      const slot = await prisma.meetingSlot.upsert({
        where: { staffUserId_date_startTime: { staffUserId, date, startTime } },
        create: {
          schoolId: ctx.org.schoolId,
          branchId: ctx.org.branchId,
          staffUserId,
          date,
          startTime,
          endTime,
          mode: 'IN_PERSON',
          location: 'Class 5-A',
        },
        update: {},
      });
      first ??= slot.id;
    }
  }
  if (!first || (await prisma.meeting.findFirst({ where: { slotId: first } })))
    return;
  const slot = await prisma.meetingSlot.update({
    where: { id: first },
    data: { status: 'BOOKED' },
  });
  const parent = await prisma.guardian.findUniqueOrThrow({
    where: { userId: userId(ctx, 'parent@eschool.local') },
  });
  await prisma.meeting.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      slotId: slot.id,
      studentId: ctx.students.get('5-A')![0].id,
      guardianId: parent.id,
      staffUserId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      mode: slot.mode,
      location: slot.location,
      agenda: 'Discuss Maths progress and homework load',
      requestedById: parent.userId!,
    },
  });
}
