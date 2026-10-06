import type { ApplicationStatus } from '../../src/generated/prisma/client';
import type { SeedClient } from './client';
import { bumpSequence, type DemoOrg } from './demo-people';

const ENQUIRIES = [
  { childName: 'Saad Anwar', guardianName: 'Anwar Ali', phone: '+923211000001', status: 'NEW' as const },
  { childName: 'Noor Fatima', guardianName: 'Kamran Shah', phone: '+923211000002', status: 'CONTACTED' as const },
  { childName: 'Taha Rehman', guardianName: 'Rehman Gul', phone: '+923211000003', status: 'CLOSED' as const },
];

const APPLICATIONS: { first: string; last: string; status: ApplicationStatus; position?: number }[] = [
  { first: 'Areeba', last: 'Nadeem', status: 'SUBMITTED' },
  { first: 'Daniyal', last: 'Hussain', status: 'TEST_SCHEDULED' },
  { first: 'Eman', last: 'Tariq', status: 'TEST_COMPLETED' },
  { first: 'Farhan', last: 'Aslam', status: 'OFFERED' },
  { first: 'Ghazal', last: 'Mirza', status: 'WAITLISTED', position: 1 },
  { first: 'Haris', last: 'Latif', status: 'WAITLISTED', position: 2 },
];

/** 3 enquiries and 6 Class 1 applications across the pipeline (2 waitlisted). */
export async function seedAdmissions(prisma: SeedClient, org: DemoOrg): Promise<void> {
  const classId = org.classes.get('Class 1')!;
  for (const e of ENQUIRIES) {
    const found = await prisma.admissionEnquiry.findFirst({ where: { branchId: org.branchId, phone: e.phone } });
    if (found) continue;
    await prisma.admissionEnquiry.create({
      data: {
        schoolId: org.schoolId,
        branchId: org.branchId,
        sessionId: org.sessionId,
        classId,
        ...e,
        source: 'Walk-in',
        followUpDate: new Date('2026-10-12'),
      },
    });
  }

  for (const [i, a] of APPLICATIONS.entries()) {
    const applicationNo = `APP-2026-${String(i + 1).padStart(4, '0')}`;
    const exists = await prisma.admissionApplication.findUnique({
      where: { branchId_applicationNo: { branchId: org.branchId, applicationNo } },
    });
    if (exists) continue;
    const child = { firstName: a.first, lastName: a.last, dob: '2020-05-1' + i, gender: i % 2 ? 'MALE' : 'FEMALE' };
    const guardians = [
      { name: `Mr. ${a.last}`, relation: 'FATHER', phone: `+92322100000${i}`, isPrimary: true },
    ];
    const tested = a.status === 'TEST_SCHEDULED' || a.status === 'TEST_COMPLETED' || a.status === 'OFFERED';
    await prisma.admissionApplication.create({
      data: {
        schoolId: org.schoolId,
        branchId: org.branchId,
        sessionId: org.sessionId,
        classId,
        applicationNo,
        status: a.status,
        childName: `${a.first} ${a.last}`,
        child,
        guardians,
        waitlistPosition: a.position ?? null,
        test: tested
          ? {
              create: {
                scheduledAt: new Date('2026-10-10T05:00:00Z'),
                venue: 'Room 101',
                scheduledById: (await prisma.user.findUniqueOrThrow({ where: { email: 'principal@eschool.local' } })).id,
                ...(a.status !== 'TEST_SCHEDULED' && { score: 42, maxScore: 50, remarks: 'Good' }),
              },
            }
          : undefined,
      },
    });
  }
  await bumpSequence(prisma, `application:${org.branchId}:2026`, APPLICATIONS.length + 1);
  await bumpSequence(prisma, `waitlist:${org.sessionId}:${classId}`, 3);
}
