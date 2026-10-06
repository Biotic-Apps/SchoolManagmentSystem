import type {
  ComplaintCategory,
  ComplaintStatus,
} from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';
import { bumpSequence } from './demo-people';

interface ComplaintSeed {
  ticket: number;
  by: string;
  role: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  assignee: string;
  against?: string;
  student?: string;
  /** Hours from now; negative = overdue. */
  slaHours: number;
}

const SEEDS: ComplaintSeed[] = [
  {
    ticket: 1,
    by: 'parent@eschool.local',
    role: 'PARENT',
    category: 'ACADEMIC',
    subject: 'Maths homework is too long',
    description:
      'Ayesha spends more than two hours on Maths homework every day.',
    status: 'ASSIGNED',
    assignee: 'teacher@eschool.local',
    student: '5-A',
    slaHours: 40,
  },
  {
    ticket: 2,
    by: 'parent@eschool.local',
    role: 'PARENT',
    category: 'FACILITY',
    subject: 'Broken fan in 4-B',
    description: 'The ceiling fan in class 4-B has not worked for a week.',
    status: 'IN_PROGRESS',
    assignee: 'principal@eschool.local',
    student: '4-B',
    slaHours: -6,
  },
  {
    ticket: 3,
    by: 'teacher@eschool.local',
    role: 'TEACHER',
    category: 'STAFF_BEHAVIOUR',
    subject: 'Timetable swaps without notice',
    description: 'Periods were swapped twice this week without informing me.',
    status: 'RESOLVED',
    assignee: 'coordinator@eschool.local',
    against: 'teacher2@eschool.local',
    slaHours: 20,
  },
  {
    ticket: 4,
    by: 'parent@eschool.local',
    role: 'PARENT',
    category: 'TRANSPORT',
    subject: 'Van arrives late',
    description:
      'The school van arrived 30 minutes late on Monday. وین دیر سے آئی۔',
    status: 'CLOSED',
    assignee: 'principal@eschool.local',
    student: '4-B',
    slaHours: 10,
  },
];

/** Four complaints in different states, one overdue. */
export async function seedComplaints(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const year = new Date().getFullYear();
  for (const seed of SEEDS) {
    const ticketNo = `CMP-${year}-${String(seed.ticket).padStart(4, '0')}`;
    if (await prisma.complaint.findUnique({ where: { ticketNo } })) continue;
    const now = Date.now();
    const resolved = seed.status === 'RESOLVED' || seed.status === 'CLOSED';
    await prisma.complaint.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: ctx.org.branchId,
        ticketNo,
        category: seed.category,
        subject: seed.subject,
        description: seed.description,
        status: seed.status,
        slaDueAt: new Date(now + seed.slaHours * 3600_000),
        complainantId: userId(ctx, seed.by),
        complainantRole: seed.role,
        againstUserId: seed.against ? userId(ctx, seed.against) : null,
        studentId: seed.student ? ctx.students.get(seed.student)![0].id : null,
        assigneeId: userId(ctx, seed.assignee),
        resolvedAt: resolved ? new Date(now - 24 * 3600_000) : null,
        closedAt: seed.status === 'CLOSED' ? new Date(now - 3600_000) : null,
        updates: {
          create: resolved
            ? [
                {
                  authorId: userId(ctx, seed.assignee),
                  message: 'Looked into it and fixed the issue.',
                  status: 'RESOLVED',
                },
              ]
            : [],
        },
      },
    });
  }
  await bumpSequence(
    prisma,
    `complaint:${ctx.org.schoolId}:${year}`,
    SEEDS.length + 1,
  );
}
