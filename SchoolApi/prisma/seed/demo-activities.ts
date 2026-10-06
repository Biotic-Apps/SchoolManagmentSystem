import type {
  ActivityStatus,
  ActivityType,
} from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { addDays, type DailyContext, userId } from './demo-daily-context';

interface ActivitySeed {
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  startDays: number;
  consentRequired: boolean;
  sections: string[];
  by: string;
}

const SEEDS: ActivitySeed[] = [
  {
    title: 'Annual Sports Day',
    type: 'SPORTS',
    status: 'ANNOUNCED',
    startDays: 10,
    consentRequired: true,
    sections: ['5-A', '5-B'],
    by: 'teacher@eschool.local',
  },
  {
    title: 'Trip to Lahore Museum',
    type: 'TRIP',
    status: 'PROPOSED',
    startDays: 20,
    consentRequired: true,
    sections: ['5-A'],
    by: 'teacher@eschool.local',
  },
  {
    title: 'Inter-class Spelling Bee',
    type: 'COMPETITION',
    status: 'COMPLETED',
    startDays: -7,
    consentRequired: false,
    sections: ['5-A', '5-B'],
    by: 'teacher2@eschool.local',
  },
];

async function create(
  prisma: SeedClient,
  ctx: DailyContext,
  seed: ActivitySeed,
) {
  const start = new Date(
    addDays(ctx.today, seed.startDays).getTime() + 4 * 3600_000,
  );
  const principal = userId(ctx, 'principal@eschool.local');
  const decided = seed.status !== 'PROPOSED';
  return prisma.activity.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      type: seed.type,
      title: seed.title,
      description: `${seed.title} for ${seed.sections.join(', ')}.`,
      startAt: start,
      endAt: new Date(start.getTime() + 4 * 3600_000),
      venue: seed.type === 'TRIP' ? 'Lahore Museum' : 'School ground',
      audience: {
        sectionIds: seed.sections.map((s) => ctx.org.sections.get(s)!),
        classIds: [],
        wholeBranch: false,
      },
      consentRequired: seed.consentRequired,
      consentDeadline: seed.consentRequired
        ? addDays(ctx.today, seed.startDays - 3)
        : null,
      feeMinor: seed.type === 'TRIP' ? 50000n : null,
      status: seed.status,
      proposedById: userId(ctx, seed.by),
      decidedById: decided ? principal : null,
      decidedAt: decided ? new Date() : null,
    },
  });
}

/** Sports day (announced, consent), a proposed trip, a completed competition with results. */
export async function seedActivities(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  for (const seed of SEEDS) {
    if (
      await prisma.activity.findFirst({
        where: { title: seed.title, branchId: ctx.org.branchId },
      })
    )
      continue;
    const activity = await create(prisma, ctx, seed);
    const students = seed.sections.flatMap((s) => ctx.students.get(s)!);
    if (seed.status === 'PROPOSED') {
      const approval = await prisma.approvalRequest.create({
        data: {
          type: 'ACTIVITY',
          entityType: 'Activity',
          entityId: activity.id,
          schoolId: ctx.org.schoolId,
          branchId: ctx.org.branchId,
          requestedById: activity.proposedById,
          title: `Activity: ${activity.title}`,
          payload: { activityId: activity.id },
          steps: { create: [{ order: 1, approverRole: 'PRINCIPAL' }] },
        },
      });
      await prisma.activity.update({
        where: { id: activity.id },
        data: { approvalId: approval.id },
      });
    }
    if (seed.status === 'ANNOUNCED') {
      const parentUser = userId(ctx, 'parent@eschool.local');
      for (const [i, student] of students.entries()) {
        const link = await prisma.studentGuardian.findFirst({
          where: { studentId: student.id, status: 'VERIFIED' },
        });
        const status =
          i % 5 === 1 ? 'GRANTED' : i % 7 === 3 ? 'DECLINED' : 'PENDING';
        await prisma.activityConsent.create({
          data: {
            activityId: activity.id,
            studentId: student.id,
            guardianId: link?.guardianId ?? null,
            status,
            respondedAt: status === 'PENDING' ? null : new Date(),
            respondedById: status === 'PENDING' ? null : parentUser,
          },
        });
      }
    }
    if (seed.status === 'COMPLETED') {
      await prisma.activityParticipant.createMany({
        data: students.slice(0, 6).map((s, i) => ({
          activityId: activity.id,
          studentId: s.id,
          role: 'Contestant',
          result: i < 3 ? ['Winner', 'Runner-up', 'Third'][i] : 'Participated',
          position: i < 3 ? i + 1 : null,
        })),
      });
    }
  }
}
