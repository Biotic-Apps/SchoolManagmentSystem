import { Prisma } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { type DailyContext, userId } from './demo-daily-context';
import { SUBJECTS as SUBJECT_NAMES } from './demo-academics';
import { CLASS5_TEACHERS } from './demo-staff';

const BANDS: [string, number, number, string][] = [
  ['A+', 90, 100, 'Outstanding'],
  ['A', 80, 89, 'Excellent'],
  ['B', 70, 79, 'Very good'],
  ['C', 60, 69, 'Good'],
  ['D', 50, 59, 'Fair'],
  ['E', 33, 49, 'Satisfactory'],
  ['F', 0, 32, 'Needs improvement'],
];
const PASS_PERCENT = 33;
const SUBJECTS = ['ENG', 'URDU', 'MATH', 'SCI'];
const SECTIONS = ['4-A', '4-B', '5-A', '5-B'];
const CLASS_TEACHER: Record<string, string> = {
  '4-A': 'teacher3@eschool.local',
  '4-B': 'newteacher@eschool.local',
};

/** Deterministic demo marks 35–98; 4-A #4 fails Maths, 5-B #3 is absent in Science. */
function demoMarks(
  section: string,
  index: number,
  subject: number,
): number | null {
  if (section === '5-B' && index === 3 && SUBJECTS[subject] === 'SCI')
    return null;
  if (section === '4-A' && index === 4 && SUBJECTS[subject] === 'MATH')
    return 21;
  return 35 + ((index * 37 + subject * 17 + section.charCodeAt(2) * 7) % 64);
}

const gradeOf = (percent: number) =>
  BANDS.find(([, min, max]) => percent >= min && percent <= max)!;

function teacherFor(
  ctx: DailyContext,
  section: string,
  subject: string,
): string | null {
  const email = CLASS5_TEACHERS[section]?.[subject] ?? CLASS_TEACHER[section];
  return email ? (ctx.staff.get(email) ?? null) : null;
}

async function ensureScheme(prisma: SeedClient, ctx: DailyContext) {
  const found = await prisma.gradingScheme.findFirst({
    where: { sessionId: ctx.org.sessionId, name: 'Standard 2026-27' },
  });
  if (found) return found;
  return prisma.gradingScheme.create({
    data: {
      schoolId: ctx.org.schoolId,
      sessionId: ctx.org.sessionId,
      name: 'Standard 2026-27',
      passPercent: PASS_PERCENT,
      status: 'APPROVED',
      approvedById: userId(ctx, 'principal@eschool.local'),
      approvedAt: new Date(),
      createdById: userId(ctx, 'coordinator@eschool.local'),
      bands: {
        create: BANDS.map(([grade, minPercent, maxPercent, remark], i) => ({
          grade,
          minPercent,
          maxPercent,
          remark,
          gradePoint: new Prisma.Decimal(Math.max(0, 4 - i * 0.5)),
        })),
      },
    },
  });
}

interface ExamSeed {
  name: string;
  type: 'MIDTERM' | 'FINAL';
  term: string;
  status: 'PUBLISHED' | 'MARKS_OPEN';
  firstDate: string;
}

async function createExam(
  prisma: SeedClient,
  ctx: DailyContext,
  schemeId: string,
  seed: ExamSeed,
) {
  const term = await prisma.term.findFirst({
    where: { sessionId: ctx.org.sessionId, name: seed.term },
  });
  const classIds = ['Class 4', 'Class 5'].map((c) => ctx.org.classes.get(c)!);
  const start = new Date(`${seed.firstDate}T00:00:00.000Z`);
  return prisma.exam.create({
    data: {
      schoolId: ctx.org.schoolId,
      branchId: ctx.org.branchId,
      sessionId: ctx.org.sessionId,
      termId: term?.id ?? null,
      name: seed.name,
      type: seed.type,
      gradingSchemeId: schemeId,
      weightPercent: seed.type === 'FINAL' ? 60 : 40,
      classIds,
      status: seed.status,
      createdById: userId(ctx, 'coordinator@eschool.local'),
      publishedAt: seed.status === 'PUBLISHED' ? new Date() : null,
      publishedById:
        seed.status === 'PUBLISHED'
          ? userId(ctx, 'principal@eschool.local')
          : null,
      computedAt: seed.status === 'PUBLISHED' ? new Date() : null,
      papers: {
        create: classIds.flatMap((classId) =>
          SUBJECTS.map((code, i) => ({
            classId,
            subjectId: ctx.org.subjects.get(code)!,
            date: new Date(start.getTime() + i * 86_400_000),
            startTime: '09:00',
            endTime: '11:00',
            maxMarks: 100,
            passMarks: 33,
          })),
        ),
      },
    },
    include: { papers: true },
  });
}

type SheetPlan = (
  section: string,
  subject: string,
) => 'ACCEPTED' | 'SUBMITTED' | 'DRAFT' | 'NOT_ENTERED';

async function createSheets(
  prisma: SeedClient,
  ctx: DailyContext,
  exam: Awaited<ReturnType<typeof createExam>>,
  plan: SheetPlan,
) {
  const coordinator = userId(ctx, 'coordinator@eschool.local');
  for (const section of SECTIONS) {
    const classId = ctx.org.classes.get(`Class ${section[0]}`)!;
    const students = ctx.students.get(section) ?? [];
    for (const [s, code] of SUBJECTS.entries()) {
      const paper = exam.papers.find(
        (p) =>
          p.classId === classId && p.subjectId === ctx.org.subjects.get(code),
      )!;
      const status = plan(section, code);
      const teacherStaffId = teacherFor(ctx, section, code);
      const teacherUser = teacherStaffId
        ? ((await prisma.staff.findUnique({ where: { id: teacherStaffId } }))
            ?.userId ?? coordinator)
        : coordinator;
      const entered = status !== 'NOT_ENTERED';
      await prisma.markSheet.create({
        data: {
          schoolId: ctx.org.schoolId,
          branchId: ctx.org.branchId,
          examId: exam.id,
          paperId: paper.id,
          sectionId: ctx.org.sections.get(section)!,
          subjectId: paper.subjectId,
          status,
          teacherStaffId,
          enteredById: entered ? teacherUser : null,
          submittedById:
            status === 'ACCEPTED' || status === 'SUBMITTED'
              ? teacherUser
              : null,
          submittedAt:
            status === 'ACCEPTED' || status === 'SUBMITTED' ? new Date() : null,
          decidedById: status === 'ACCEPTED' ? coordinator : null,
          decidedAt: status === 'ACCEPTED' ? new Date() : null,
          marks: entered
            ? {
                create: students.map((student, i) => {
                  // The 5-A Maths draft leaves the last student pending (null, not absent).
                  const pending =
                    status === 'DRAFT' && i === students.length - 1;
                  const marks = pending ? null : demoMarks(section, i, s);
                  return {
                    studentId: student.id,
                    marks: marks === null ? null : new Prisma.Decimal(marks),
                    absent: !pending && marks === null,
                  };
                }),
              }
            : undefined,
        },
      });
    }
  }
}

async function createResults(
  prisma: SeedClient,
  ctx: DailyContext,
  examId: string,
) {
  for (const section of SECTIONS) {
    const students = ctx.students.get(section) ?? [];
    const rows = students.map((student, i) => {
      const subjects = SUBJECTS.map((code, s) => {
        const marks = demoMarks(section, i, s);
        const pct = marks ?? 0;
        return {
          subjectId: ctx.org.subjects.get(code)!,
          name: SUBJECT_NAMES.find(([c]) => c === code)?.[1] ?? code,
          marks,
          maxMarks: 100,
          absent: marks === null,
          grade: marks === null ? null : gradeOf(pct)[0],
          passed: marks !== null && marks >= 33,
        };
      });
      const total = subjects.reduce((sum, s) => sum + (s.marks ?? 0), 0);
      const maxTotal = SUBJECTS.length * 100;
      const hundredths = Math.floor(
        (total * 10_000 * 2 + maxTotal) / (maxTotal * 2),
      ); // percent × 100, half-up
      const percent = hundredths / 100;
      const grade = gradeOf(Math.floor(percent));
      const passed = subjects.every((s) => s.passed) && percent >= PASS_PERCENT;
      return { student, subjects, total, maxTotal, hundredths, grade, passed };
    });
    const sorted = [...rows].sort((a, b) => b.hundredths - a.hundredths);
    for (const row of rows) {
      const position =
        sorted.findIndex((r) => r.hundredths === row.hundredths) + 1;
      await prisma.examResult.create({
        data: {
          schoolId: ctx.org.schoolId,
          branchId: ctx.org.branchId,
          examId,
          studentId: row.student.id,
          sectionId: ctx.org.sections.get(section)!,
          classId: ctx.org.classes.get(`Class ${section[0]}`)!,
          totalMarks: new Prisma.Decimal(row.total),
          maxTotal: row.maxTotal,
          percent: new Prisma.Decimal(row.hundredths).div(100),
          grade: row.grade[0],
          position,
          passed: row.passed,
          remarks: row.grade[3],
          subjects: row.subjects,
        },
      });
    }
  }
}

/** Phase 4 §J: grading scheme, published mid-term (marks + results), final exam with marks open. */
export async function seedResults(
  prisma: SeedClient,
  ctx: DailyContext,
): Promise<void> {
  const scheme = await ensureScheme(prisma, ctx);
  if (
    !(await prisma.exam.findFirst({
      where: { branchId: ctx.org.branchId, name: 'Mid-term 2026' },
    }))
  ) {
    const exam = await createExam(prisma, ctx, scheme.id, {
      name: 'Mid-term 2026',
      type: 'MIDTERM',
      term: 'Term 1',
      status: 'PUBLISHED',
      firstDate: '2026-09-14',
    });
    await createSheets(prisma, ctx, exam, () => 'ACCEPTED');
    await createResults(prisma, ctx, exam.id);
  }
  if (
    !(await prisma.exam.findFirst({
      where: { branchId: ctx.org.branchId, name: 'Final 2027' },
    }))
  ) {
    const exam = await createExam(prisma, ctx, scheme.id, {
      name: 'Final 2027',
      type: 'FINAL',
      term: 'Term 2',
      status: 'MARKS_OPEN',
      firstDate: '2027-03-08',
    });
    await createSheets(prisma, ctx, exam, (section, subject) =>
      section === '5-A' && subject === 'MATH'
        ? 'DRAFT'
        : section === '5-B' && subject === 'ENG'
          ? 'SUBMITTED'
          : 'NOT_ENTERED',
    );
  }
}
