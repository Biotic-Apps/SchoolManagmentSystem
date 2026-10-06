import type { DiaryStatus } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';

interface DiarySeed {
  section: string;
  subject: string;
  date: Date;
  author: string;
  status: DiaryStatus;
  topics: string;
  homework?: string;
}

const MATH_TOPICS = ['Fractions: adding like fractions', 'Fractions: unlike denominators', 'Decimals: place value', 'Decimals: rounding', 'Word problems with decimals'];
const ENG_TOPICS = ['Reading: The Honest Woodcutter', 'Grammar: adjectives', 'Writing: a short letter', 'Spelling list 7', 'Comprehension practice'];

async function upsertEntry(prisma: SeedClient, ctx: DailyContext, seed: DiarySeed): Promise<string> {
  const sectionId = ctx.org.sections.get(seed.section)!;
  const subjectId = ctx.org.subjects.get(seed.subject)!;
  const existing = await prisma.diaryEntry.findUnique({
    where: { sectionId_subjectId_date: { sectionId, subjectId, date: seed.date } },
  });
  if (existing) return existing.id;
  const author = userId(ctx, seed.author);
  const row = await prisma.diaryEntry.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      sessionId: ctx.org.sessionId,
      sectionId,
      subjectId,
      date: seed.date,
      topics: seed.topics,
      homework: seed.homework,
      status: seed.status,
      authorId: author,
      publishedAt: seed.status === 'PUBLISHED' ? new Date(seed.date.getTime() + 8 * 3600_000) : null,
      publishedById: seed.status === 'PUBLISHED' ? author : null,
    },
  });
  return row.id;
}

/** Last 5 school days of Maths (5-A, 5-B) and English (5-A); a helper draft; a probation entry in review. */
export async function seedDiary(prisma: SeedClient, ctx: DailyContext): Promise<void> {
  const days = ctx.days.slice(0, 5);
  for (const [i, date] of days.entries()) {
    for (const section of ['5-A', '5-B']) {
      await upsertEntry(prisma, ctx, {
        section,
        subject: 'MATH',
        date,
        author: 'teacher@eschool.local',
        status: 'PUBLISHED',
        topics: MATH_TOPICS[i],
        homework: `Exercise ${i + 3}, questions 1–5. کاپی میں حل کریں۔`,
      });
    }
    if (i > 0) {
      await upsertEntry(prisma, ctx, {
        section: '5-A',
        subject: 'ENG',
        date,
        author: 'newteacher@eschool.local',
        status: 'PUBLISHED',
        topics: ENG_TOPICS[i],
      });
    }
  }
  const latest = days[0];
  await upsertEntry(prisma, ctx, {
    section: '5-A',
    subject: 'SCI',
    date: latest,
    author: 'helper@eschool.local',
    status: 'DRAFT',
    topics: 'Plants: parts of a flower (draft by helper)',
    homework: 'Draw and label a flower.',
  });
  const pendingId = await upsertEntry(prisma, ctx, {
    section: '5-A',
    subject: 'ENG',
    date: latest,
    author: 'newteacher@eschool.local',
    status: 'PENDING_REVIEW',
    topics: ENG_TOPICS[0],
    homework: 'Read pages 12–14.',
  });
  const held = await prisma.approvalRequest.findFirst({ where: { entityId: pendingId, type: 'PROBATION_REVIEW' } });
  if (held) return;
  const staffId = ctx.staff.get('newteacher@eschool.local')!;
  const approval = await prisma.approvalRequest.create({
    data: {
      type: 'PROBATION_REVIEW',
      entityType: 'DiaryEntry',
      entityId: pendingId,
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      requestedById: userId(ctx, 'newteacher@eschool.local'),
      title: `Diary ${latest.toISOString().slice(0, 10)}`,
      payload: { action: 'diary.publish', payload: { entryId: pendingId }, staffId, onBehalfOfStaffId: staffId },
      steps: { create: [{ order: 1, approverUserId: userId(ctx, 'coordinator@eschool.local') }] },
    },
  });
  await prisma.diaryEntry.update({ where: { id: pendingId }, data: { approvalId: approval.id } });
}
