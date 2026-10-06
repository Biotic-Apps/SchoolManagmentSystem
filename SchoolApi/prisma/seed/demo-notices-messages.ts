import type { SeedClient } from './client';
import { addDays, type DailyContext, userId } from './demo-daily-context';

async function guardianUsers(prisma: SeedClient, studentIds: string[]): Promise<string[]> {
  const links = await prisma.studentGuardian.findMany({
    where: { studentId: { in: studentIds }, status: 'VERIFIED', guardian: { userId: { not: null } } },
    select: { guardian: { select: { userId: true } } },
  });
  return [...new Set(links.map((l) => l.guardian.userId!))];
}

/** Two published notices (school-wide, 5-A) with read receipts. */
export async function seedNotices(prisma: SeedClient, ctx: DailyContext): Promise<void> {
  const staffUsers = [...ctx.staff.keys()].map((email) => userId(ctx, email));
  const allStudents = [...ctx.students.values()].flat().map((s) => s.id);
  const fiveA = (ctx.students.get('5-A') ?? []).map((s) => s.id);
  const notices = [
    {
      title: 'School closed on Friday',
      body: 'The school will remain closed on Friday for maintenance. جمعہ کو سکول بند رہے گا۔',
      audience: { schoolWide: true },
      branchId: null,
      author: 'principal@eschool.local',
      pinned: true,
      recipients: [...staffUsers, ...(await guardianUsers(prisma, allStudents))],
    },
    {
      title: '5-A: Science project due',
      body: 'Please help your child finish the science model by next Monday.',
      audience: { sectionIds: [ctx.org.sections.get('5-A')!] },
      branchId: ctx.org.branchId,
      author: 'teacher@eschool.local',
      pinned: false,
      recipients: await guardianUsers(prisma, fiveA),
    },
  ];
  for (const n of notices) {
    if (await prisma.notice.findFirst({ where: { title: n.title, schoolId: ctx.org.schoolId } })) continue;
    const author = userId(ctx, n.author);
    await prisma.notice.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: n.branchId,
        title: n.title,
        body: n.body,
        audience: n.audience,
        pinned: n.pinned,
        expiresOn: addDays(ctx.today, 14),
        status: 'PUBLISHED',
        authorId: author,
        publishedAt: new Date(),
        publishedById: userId(ctx, 'principal@eschool.local'),
        recipients: {
          create: [...new Set(n.recipients)]
            .filter((id) => id !== author)
            .map((id, i) => ({ userId: id, readAt: i % 3 === 0 ? new Date() : null })),
        },
      },
    });
  }
}

/** Two threads between parent@ and teacher@ about Ayesha (5-A). */
export async function seedMessages(prisma: SeedClient, ctx: DailyContext): Promise<void> {
  const parent = userId(ctx, 'parent@eschool.local');
  const teacher = userId(ctx, 'teacher@eschool.local');
  const ayesha = ctx.students.get('5-A')![0].id;
  const threads = [
    {
      subject: 'Homework question',
      messages: [
        [parent, 'PARENT', 'Assalam o Alaikum, is exercise 5 due tomorrow?'],
        [teacher, 'TEACHER', 'Walaikum Assalam, yes, questions 1–5 only.'],
      ],
    },
    {
      subject: 'Sports day participation',
      messages: [[teacher, 'TEACHER', 'Ayesha did well in practice. Please sign the consent for sports day.']],
    },
  ] as const;
  for (const t of threads) {
    if (await prisma.messageThread.findFirst({ where: { studentId: ayesha, subject: t.subject } })) continue;
    const start = Date.now() - 2 * 86_400_000;
    await prisma.messageThread.create({
      data: {
        schoolId: ctx.org.schoolId,
        branchId: ctx.org.branchId,
        studentId: ayesha,
        subject: t.subject,
        createdById: t.messages[0][0],
        lastMessageAt: new Date(start + t.messages.length * 600_000),
        participants: {
          create: [
            { userId: parent, role: 'PARENT', lastReadAt: new Date(start) },
            { userId: teacher, role: 'TEACHER', lastReadAt: new Date() },
          ],
        },
        messages: {
          create: t.messages.map(([senderId, senderRole, body], i) => ({
            senderId,
            senderRole,
            body,
            sentAt: new Date(start + (i + 1) * 600_000),
          })),
        },
      },
    });
  }
}
