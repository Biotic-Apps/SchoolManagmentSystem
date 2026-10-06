import {
  findConflicts,
  teachingKey,
} from '../../src/modules/timetable/conflicts/conflict-checker';
import type { SeedClient } from './client';
import type { DemoOrg } from './demo-people';
import { CLASS5_TEACHERS } from './demo-staff';

const PERIODS = [
  { index: 1, startTime: '08:00', endTime: '08:40', isBreak: false },
  { index: 2, startTime: '08:40', endTime: '09:20', isBreak: false },
  { index: 3, startTime: '09:20', endTime: '10:00', isBreak: false },
  { index: 4, startTime: '10:00', endTime: '10:40', isBreak: false },
  {
    index: 5,
    startTime: '10:40',
    endTime: '11:00',
    isBreak: true,
    label: 'Break',
  },
  { index: 6, startTime: '11:00', endTime: '11:40', isBreak: false },
  { index: 7, startTime: '11:40', endTime: '12:20', isBreak: false },
  { index: 8, startTime: '12:20', endTime: '13:00', isBreak: false },
];
const TEACHING = PERIODS.filter((p) => !p.isBreak).map((p) => p.index);
const SUBJECTS = ['MATH', 'ENG', 'SCI', 'URDU', 'ISL', 'SST', 'COMP'];
const DAYS = [1, 2, 3, 4, 5, 6];

interface Planned {
  day: number;
  periodIndex: number;
  subjectId: string;
  staffId: string;
  roomId: string | null;
}

export async function seedPeriods(
  prisma: SeedClient,
  org: DemoOrg,
): Promise<void> {
  for (const p of PERIODS) {
    await prisma.branchPeriod.upsert({
      where: { branchId_index: { branchId: org.branchId, index: p.index } },
      create: { schoolId: org.schoolId, branchId: org.branchId, ...p },
      update: {},
    });
  }
}

/** Published 5-A and 5-B timetables; 5-B is planned around 5-A so no teacher clashes. */
export async function seedTimetables(
  prisma: SeedClient,
  org: DemoOrg,
  staffIds: Map<string, string>,
) {
  const staffOf = (section: string, code: string) =>
    staffIds.get(CLASS5_TEACHERS[section][code])!;
  const rooms = await prisma.section.findMany({
    where: { id: { in: [org.sections.get('5-A')!, org.sections.get('5-B')!] } },
    select: { id: true, roomId: true },
  });
  const roomOf = (key: string) =>
    rooms.find((r) => r.id === org.sections.get(key))?.roomId ?? null;

  const planA: Planned[] = [];
  const planB: Planned[] = [];
  let g = 0;
  for (const day of DAYS) {
    for (const periodIndex of TEACHING) {
      const codeA = SUBJECTS[g % SUBJECTS.length];
      const teacherA = staffOf('5-A', codeA);
      planA.push({
        day,
        periodIndex,
        subjectId: org.subjects.get(codeA)!,
        staffId: teacherA,
        roomId: roomOf('5-A'),
      });
      const codeB = [
        ...SUBJECTS.slice((g + 3) % 7),
        ...SUBJECTS.slice(0, (g + 3) % 7),
      ].find((code) => staffOf('5-B', code) !== teacherA)!;
      planB.push({
        day,
        periodIndex,
        subjectId: org.subjects.get(codeB)!,
        staffId: staffOf('5-B', codeB),
        roomId: roomOf('5-B'),
      });
      g++;
    }
  }
  const clashes = findConflicts({
    slots: planB,
    breakPeriods: new Set([5]),
    workingDays: new Set(DAYS),
    others: planA.map((s) => ({ ...s, sectionId: '5-A' })),
    teaching: new Set(
      Object.entries(CLASS5_TEACHERS['5-B']).map(([code, email]) =>
        teachingKey(staffIds.get(email)!, org.subjects.get(code)!),
      ),
    ),
  });
  if (clashes.length > 0)
    throw new Error(
      `Seed timetable has conflicts: ${JSON.stringify(clashes[0])}`,
    );

  for (const [key, plan] of [
    ['5-A', planA],
    ['5-B', planB],
  ] as const) {
    const sectionId = org.sections.get(key)!;
    const timetable = await prisma.timetable.upsert({
      where: { sectionId_sessionId: { sectionId, sessionId: org.sessionId } },
      create: {
        schoolId: org.schoolId,
        branchId: org.branchId,
        sessionId: org.sessionId,
        sectionId,
        status: 'PUBLISHED',
        version: 1,
        publishedAt: new Date(),
      },
      update: {},
    });
    if (
      (await prisma.timetableSlot.count({
        where: { timetableId: timetable.id },
      })) > 0
    )
      continue;
    await prisma.timetableSlot.createMany({
      data: plan.map((s) => ({
        ...s,
        timetableId: timetable.id,
        published: true,
      })),
    });
  }
}
