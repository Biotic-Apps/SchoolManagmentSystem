import type { TopicStatus } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import type { DemoOrg } from './demo-people';

const BOOKS = [
  {
    subject: 'MATH',
    title: 'New Countdown Mathematics 5',
    publisher: 'Oxford',
    priceMinor: 95000,
  },
  {
    subject: 'ENG',
    title: 'Oxford Modern English 5',
    publisher: 'Oxford',
    priceMinor: 85000,
  },
  {
    subject: 'SCI',
    title: 'Science Explorer 5',
    publisher: 'Oxford',
    priceMinor: 90000,
  },
  {
    subject: 'URDU',
    title: 'Urdu Ki Kitab 5',
    publisher: 'Punjab Textbook Board',
    priceMinor: 40000,
  },
];

type TopicSeed = [
  title: string,
  target: string,
  status: TopicStatus,
  completedOn?: string,
];

const MATH_PLAN: [string, TopicSeed[]][] = [
  [
    'Numbers and Place Value',
    [
      ['Large numbers', '2026-04-20', 'COMPLETED', '2026-04-18'],
      ['Rounding', '2026-05-05', 'COMPLETED', '2026-05-06'],
      ['Roman numerals', '2026-05-20', 'COMPLETED', '2026-05-19'],
    ],
  ],
  [
    'Fractions',
    [
      ['Equivalent fractions', '2026-08-25', 'COMPLETED', '2026-08-27'],
      ['Adding fractions', '2026-09-10', 'IN_PROGRESS'],
      ['Multiplying fractions', '2026-09-25', 'NOT_STARTED'],
    ],
  ],
  [
    'Geometry',
    [
      ['Angles', '2026-11-05', 'NOT_STARTED'],
      ['Triangles', '2026-11-25', 'NOT_STARTED'],
      ['Area and perimeter', '2026-12-15', 'NOT_STARTED'],
    ],
  ],
];

const ENGLISH_PLAN: [string, TopicSeed[]][] = [
  [
    'Grammar',
    [
      ['Tenses', '2026-11-10', 'NOT_STARTED'],
      ['Active and passive voice', '2026-11-30', 'NOT_STARTED'],
    ],
  ],
  ['Writing', [['Letter writing', '2026-12-20', 'NOT_STARTED']]],
];

export async function seedBookList(
  prisma: SeedClient,
  org: DemoOrg,
): Promise<void> {
  const classId = org.classes.get('Class 5')!;
  const list = await prisma.bookList.upsert({
    where: {
      branchId_sessionId_classId: {
        branchId: org.branchId,
        sessionId: org.sessionId,
        classId,
      },
    },
    create: {
      schoolId: org.schoolId,
      branchId: org.branchId,
      sessionId: org.sessionId,
      classId,
    },
    update: {},
  });
  if (
    (await prisma.bookListRevision.count({ where: { bookListId: list.id } })) >
    0
  )
    return;
  await prisma.bookListRevision.create({
    data: {
      bookListId: list.id,
      revision: 1,
      status: 'APPROVED',
      approvedAt: new Date('2026-03-20'),
      items: {
        create: BOOKS.map((b, i) => ({
          subjectId: org.subjects.get(b.subject),
          title: b.title,
          publisher: b.publisher,
          isMandatory: true,
          priceMinor: b.priceMinor,
          sortOrder: i + 1,
        })),
      },
    },
  });
}

async function seedPlan(
  prisma: SeedClient,
  org: DemoOrg,
  section: string,
  subject: string,
  chapters: [string, TopicSeed[]][],
) {
  const sectionId = org.sections.get(section)!;
  const subjectId = org.subjects.get(subject)!;
  const existing = await prisma.syllabusPlan.findUnique({
    where: {
      sectionId_subjectId_sessionId: {
        sectionId,
        subjectId,
        sessionId: org.sessionId,
      },
    },
  });
  if (existing) return;
  const plan = await prisma.syllabusPlan.create({
    data: {
      schoolId: org.schoolId,
      branchId: org.branchId,
      sessionId: org.sessionId,
      sectionId,
      subjectId,
      status: 'APPROVED',
      approvedAt: new Date('2026-04-05'),
    },
  });
  for (const [c, [title, topics]] of chapters.entries()) {
    const chapter = await prisma.syllabusChapter.create({
      data: { planId: plan.id, title, order: c + 1 },
    });
    await prisma.syllabusTopic.createMany({
      data: topics.map(([topic, target, status, completedOn], t) => ({
        planId: plan.id,
        chapterId: chapter.id,
        title: topic,
        order: t + 1,
        targetDate: new Date(target),
        status,
        completedOn: completedOn ? new Date(completedOn) : null,
      })),
    });
  }
}

/** Approved 5-A Maths plan (some topics done, some delayed) and 5-A English plan. */
export async function seedSyllabus(
  prisma: SeedClient,
  org: DemoOrg,
): Promise<void> {
  await seedBookList(prisma, org);
  await seedPlan(prisma, org, '5-A', 'MATH', MATH_PLAN);
  await seedPlan(prisma, org, '5-A', 'ENG', ENGLISH_PLAN);
}
