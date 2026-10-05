import type { SeedClient } from './client';

const SUBJECTS = [
  ['ENG', 'English'],
  ['URDU', 'Urdu'],
  ['MATH', 'Mathematics'],
  ['SCI', 'General Science'],
  ['ISL', 'Islamiat'],
  ['SST', 'Social Studies'],
  ['COMP', 'Computer'],
] as const;

interface Org {
  school: { id: string };
  branch: { id: string };
  session: { id: string };
}

/** Classes 1–5 with sections A/B, subjects, class subjects and rooms. */
export async function seedAcademics(prisma: SeedClient, org: Org): Promise<void> {
  const schoolId = org.school.id;
  const subjects = [];
  for (const [code, name] of SUBJECTS) {
    subjects.push(
      await prisma.subject.upsert({
        where: { schoolId_code: { schoolId, code } },
        create: { schoolId, code, name },
        update: {},
      }),
    );
  }

  for (let level = 1; level <= 5; level++) {
    const schoolClass = await prisma.schoolClass.upsert({
      where: { schoolId_name: { schoolId, name: `Class ${level}` } },
      create: { schoolId, name: `Class ${level}`, levelOrder: level },
      update: {},
    });
    await prisma.classSubject.createMany({
      data: subjects.map((s) => ({ schoolId, classId: schoolClass.id, subjectId: s.id })),
      skipDuplicates: true,
    });
    for (const [index, sectionName] of ['A', 'B'].entries()) {
      const roomName = `Room ${level}0${index + 1}`;
      const room = await prisma.room.upsert({
        where: { branchId_name: { branchId: org.branch.id, name: roomName } },
        create: { schoolId, branchId: org.branch.id, name: roomName, capacity: 35 },
        update: {},
      });
      await prisma.section.upsert({
        where: {
          sessionId_classId_name: { sessionId: org.session.id, classId: schoolClass.id, name: sectionName },
        },
        create: {
          schoolId,
          branchId: org.branch.id,
          sessionId: org.session.id,
          classId: schoolClass.id,
          name: sectionName,
          capacity: 30,
          roomId: room.id,
        },
        update: {},
      });
    }
  }
}
