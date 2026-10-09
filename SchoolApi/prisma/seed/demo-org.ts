import type { SeedClient } from './client';

const TIMINGS = {
  opensAt: '08:00',
  closesAt: '14:00',
  attendanceLockAt: '11:00',
  staffArrivesAt: '07:30',
  staffLeavesAt: '14:00',
};

export async function seedOrganisation(prisma: SeedClient) {
  const school = await prisma.school.upsert({
    where: { code: 'BRIGHT' },
    create: {
      code: 'BRIGHT',
      name: 'Bright School',
      email: 'info@bright.school',
      phone: '+924200000000',
    },
    update: {},
  });
  const branch = await prisma.branch.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'MAIN' } },
    create: {
      schoolId: school.id,
      code: 'MAIN',
      name: 'Main Branch',
      timings: TIMINGS,
      workingDays: [1, 2, 3, 4, 5, 6],
    },
    update: {},
  });
  const session = await prisma.academicSession.upsert({
    where: { branchId_name: { branchId: branch.id, name: '2026-27' } },
    create: {
      schoolId: school.id,
      branchId: branch.id,
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      status: 'ACTIVE',
    },
    update: {},
  });
  const terms = [
    {
      name: 'Term 1',
      sortOrder: 1,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
    },
    {
      name: 'Term 2',
      sortOrder: 2,
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-03-31'),
    },
  ];
  for (const term of terms) {
    await prisma.term.upsert({
      where: { sessionId_name: { sessionId: session.id, name: term.name } },
      create: {
        ...term,
        schoolId: school.id,
        branchId: branch.id,
        sessionId: session.id,
      },
      update: {},
    });
  }
  return { school, branch, session };
}
