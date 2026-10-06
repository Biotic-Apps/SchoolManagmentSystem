import type { SeedClient } from './client';

export interface DemoOrg {
  schoolId: string;
  schoolCode: string;
  branchId: string;
  sessionId: string;
  /** `5-A` → section id */
  sections: Map<string, string>;
  /** subject code → id */
  subjects: Map<string, string>;
  /** `Class 1` → class id */
  classes: Map<string, string>;
}

export async function loadOrg(
  prisma: SeedClient,
  ids: { schoolId: string; branchId: string; sessionId: string },
): Promise<DemoOrg> {
  const [school, sections, subjects, classes] = await Promise.all([
    prisma.school.findUniqueOrThrow({ where: { id: ids.schoolId } }),
    prisma.section.findMany({ where: { sessionId: ids.sessionId }, include: { schoolClass: true } }),
    prisma.subject.findMany({ where: { schoolId: ids.schoolId } }),
    prisma.schoolClass.findMany({ where: { schoolId: ids.schoolId } }),
  ]);
  return {
    ...ids,
    schoolCode: school.code,
    sections: new Map(
      sections.map((s) => [`${s.schoolClass.name.replace('Class ', '')}-${s.name}`, s.id]),
    ),
    subjects: new Map(subjects.map((s) => [s.code, s.id])),
    classes: new Map(classes.map((c) => [c.name, c.id])),
  };
}

const FIRST = ['Ali', 'Ayesha', 'Hamza', 'Fatima', 'Usman', 'Zainab', 'Bilal', 'Maryam', 'Hassan', 'Hira'];
const LAST = ['Khan', 'Ahmed', 'Malik', 'Raza', 'Siddiqui', 'Qureshi', 'Butt', 'Sheikh', 'Iqbal', 'Javed'];
const SECTIONS = ['4-A', '4-B', '5-A', '5-B'];

/** parent@ → first child of 5-A and 4-B; teacherparent@ → first child of 4-A. */
const SPECIAL_GUARDIANS: Record<string, { email: string; phone: string }> = {
  '5-A:0': { email: 'parent@eschool.local', phone: '+923001112233' },
  '4-B:0': { email: 'parent@eschool.local', phone: '+923001112233' },
  '4-A:0': { email: 'teacherparent@eschool.local', phone: '+923004445566' },
};

async function guardianFor(prisma: SeedClient, org: DemoOrg, key: string, n: number, lastName: string) {
  const special = SPECIAL_GUARDIANS[key];
  if (special) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: special.email } });
    return prisma.guardian.upsert({
      where: { userId: user.id },
      create: {
        schoolId: org.schoolId,
        userId: user.id,
        name: user.name,
        relation: 'FATHER',
        phone: special.phone,
        email: user.email,
      },
      update: {},
    });
  }
  const phone = `+92300${String(2000000 + n).padStart(7, '0')}`;
  const existing = await prisma.guardian.findFirst({ where: { schoolId: org.schoolId, phone } });
  return (
    existing ??
    prisma.guardian.create({
      data: { schoolId: org.schoolId, name: `Mr. ${lastName}`, relation: 'FATHER', phone, occupation: 'Business' },
    })
  );
}

/** 40 students (10 per section of Class 4–5) with guardians and enrollments. */
export async function seedStudents(prisma: SeedClient, org: DemoOrg): Promise<void> {
  let n = 0;
  for (const sectionKey of SECTIONS) {
    const sectionId = org.sections.get(sectionKey)!;
    const level = Number(sectionKey[0]);
    for (let i = 0; i < 10; i++) {
      n++;
      const admissionNo = `${org.schoolCode}-2026-${String(n).padStart(4, '0')}`;
      const firstName = FIRST[n % FIRST.length];
      const lastName = LAST[(n * 7 + Math.floor(n / 10)) % LAST.length];
      const student = await prisma.student.upsert({
        where: { schoolId_admissionNo: { schoolId: org.schoolId, admissionNo } },
        create: {
          schoolId: org.schoolId,
          admissionNo,
          firstName,
          lastName,
          dob: new Date(Date.UTC(2026 - level - 5, i % 12, 1 + i)),
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          admissionDate: new Date('2026-04-01'),
          address: `House ${n}, Street ${i + 1}, Lahore`,
        },
        update: { firstName, lastName },
      });
      const active = await prisma.enrollment.findFirst({ where: { studentId: student.id, status: 'ACTIVE' } });
      if (!active) {
        await prisma.enrollment.create({
          data: {
            schoolId: org.schoolId,
            studentId: student.id,
            branchId: org.branchId,
            sessionId: org.sessionId,
            sectionId,
            rollNo: i + 1,
            startDate: new Date('2026-04-01'),
            reason: 'Admission',
          },
        });
      }
      const guardian = await guardianFor(prisma, org, `${sectionKey}:${i}`, n, lastName);
      const linked = await prisma.studentGuardian.findFirst({
        where: { studentId: student.id, guardianId: guardian.id, status: 'VERIFIED' },
      });
      if (!linked) {
        await prisma.studentGuardian.create({
          data: {
            schoolId: org.schoolId,
            studentId: student.id,
            guardianId: guardian.id,
            relation: 'FATHER',
            isPrimary: true,
            status: 'VERIFIED',
            verifiedAt: new Date(),
          },
        });
      }
      if (i === 2) {
        await prisma.studentHealthProfile.upsert({
          where: { studentId: student.id },
          create: { studentId: student.id, allergies: 'Peanuts', notes: 'Carries an inhaler' },
          update: {},
        });
      }
    }
  }
  await bumpSequence(prisma, `admission:${org.schoolId}:2026`, n + 1);
}

export async function bumpSequence(prisma: SeedClient, key: string, next: number): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "sequences" ("scope_key", "next_value", "updated_at") VALUES (${key}, ${next}, now())
    ON CONFLICT ("scope_key") DO UPDATE SET "next_value" = GREATEST("sequences"."next_value", ${next}), "updated_at" = now()`;
}
