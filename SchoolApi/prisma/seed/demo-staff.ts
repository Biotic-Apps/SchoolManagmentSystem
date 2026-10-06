import type { StaffAssignmentKind } from '../../src/generated/prisma/client';
import { createRoleAssignment } from '../../src/modules/staff/assignments/assignment-role-sync';
import type { SeedClient } from './client';
import type { DemoOrg } from './demo-people';

export interface StaffSeed {
  email: string;
  employeeNo: string;
  designation: string;
}

export const DEMO_STAFF: StaffSeed[] = [
  { email: 'teacher@eschool.local', employeeNo: 'EMP-001', designation: 'TEACHER' },
  { email: 'coordinator@eschool.local', employeeNo: 'EMP-002', designation: 'COORDINATOR' },
  { email: 'accountant@eschool.local', employeeNo: 'EMP-003', designation: 'ACCOUNTANT' },
  { email: 'teacher2@eschool.local', employeeNo: 'EMP-004', designation: 'TEACHER' },
  { email: 'teacher3@eschool.local', employeeNo: 'EMP-005', designation: 'TEACHER' },
  { email: 'newteacher@eschool.local', employeeNo: 'EMP-006', designation: 'TEACHER' },
  { email: 'teacherparent@eschool.local', employeeNo: 'EMP-007', designation: 'TEACHER' },
  { email: 'helper@eschool.local', employeeNo: 'EMP-008', designation: 'HELPER' },
];

/** Staff record per demo login (idempotent by user). Returns staff id by email. */
export async function seedStaff(prisma: SeedClient, org: DemoOrg): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const seed of DEMO_STAFF) {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: seed.email } });
    const staff = await prisma.staff.upsert({
      where: { userId: user.id },
      create: {
        schoolId: org.schoolId,
        branchId: org.branchId,
        userId: user.id,
        name: user.name,
        email: user.email,
        employeeNo: seed.employeeNo,
        designation: seed.designation,
        joinDate: new Date('2026-04-01'),
      },
      update: { designation: seed.designation },
    });
    ids.set(seed.email, staff.id);
  }
  const coordinator = await prisma.user.findUniqueOrThrow({ where: { email: 'coordinator@eschool.local' } });
  await prisma.staff.update({
    where: { id: ids.get('newteacher@eschool.local') },
    data: { requiresReview: true, reviewerUserId: coordinator.id },
  });
  return ids;
}

export interface AssignmentSeed {
  staffEmail: string;
  kind: StaffAssignmentKind;
  section?: string;
  subject?: string;
  responsibleEmail?: string;
}

/** Creates the staff assignment and its mirrored role assignment once. */
export async function ensureStaffAssignment(
  prisma: SeedClient,
  org: DemoOrg,
  staffIds: Map<string, string>,
  seed: AssignmentSeed,
): Promise<void> {
  const staffId = staffIds.get(seed.staffEmail)!;
  const sectionId = seed.section ? org.sections.get(seed.section)! : null;
  const subjectId = seed.subject ? org.subjects.get(seed.subject)! : null;
  const found = await prisma.staffAssignment.findFirst({
    where: { staffId, kind: seed.kind, sectionId, subjectId, endedAt: null },
  });
  if (found) return;
  const staff = await prisma.staff.findUniqueOrThrow({ where: { id: staffId } });
  await prisma.$transaction(async (tx) => {
    const roleAssignmentId = await createRoleAssignment(tx, {
      userId: staff.userId!,
      kind: seed.kind,
      schoolId: org.schoolId,
      branchId: org.branchId,
      sectionId,
      subjectId,
      validUntil: null,
      grantedById: staff.userId!,
    });
    await tx.staffAssignment.create({
      data: {
        schoolId: org.schoolId,
        branchId: org.branchId,
        sessionId: org.sessionId,
        staffId,
        kind: seed.kind,
        sectionId,
        subjectId,
        roleAssignmentId,
        responsibleStaffId: seed.responsibleEmail ? staffIds.get(seed.responsibleEmail) : null,
      },
    });
    if (seed.kind === 'CLASS_TEACHER' && sectionId) {
      await tx.section.update({ where: { id: sectionId }, data: { classTeacherStaffId: staffId } });
    }
  });
}

/** Who teaches what in Class 5 (also drives the seeded timetable). */
export const CLASS5_TEACHERS: Record<string, Record<string, string>> = {
  '5-A': {
    MATH: 'teacher@eschool.local',
    ENG: 'newteacher@eschool.local',
    SCI: 'teacher2@eschool.local',
    URDU: 'teacher3@eschool.local',
    ISL: 'teacher3@eschool.local',
    SST: 'newteacher@eschool.local',
    COMP: 'teacher2@eschool.local',
  },
  '5-B': {
    MATH: 'teacher@eschool.local',
    ENG: 'teacher2@eschool.local',
    SCI: 'teacher2@eschool.local',
    URDU: 'teacher3@eschool.local',
    ISL: 'teacher3@eschool.local',
    SST: 'newteacher@eschool.local',
    COMP: 'teacher2@eschool.local',
  },
};

export async function seedAssignments(
  prisma: SeedClient,
  org: DemoOrg,
  staffIds: Map<string, string>,
): Promise<void> {
  const seeds: AssignmentSeed[] = [
    { staffEmail: 'teacher@eschool.local', kind: 'CLASS_TEACHER', section: '5-A' },
    { staffEmail: 'teacher2@eschool.local', kind: 'CLASS_TEACHER', section: '5-B' },
    { staffEmail: 'teacher3@eschool.local', kind: 'CLASS_TEACHER', section: '4-A' },
    { staffEmail: 'newteacher@eschool.local', kind: 'CLASS_TEACHER', section: '4-B' },
    { staffEmail: 'coordinator@eschool.local', kind: 'COORDINATOR' },
    { staffEmail: 'helper@eschool.local', kind: 'HELPER', section: '5-A', responsibleEmail: 'teacher@eschool.local' },
  ];
  for (const [section, subjects] of Object.entries(CLASS5_TEACHERS)) {
    for (const [subject, staffEmail] of Object.entries(subjects)) {
      seeds.push({ staffEmail, kind: 'SUBJECT_TEACHER', section, subject });
    }
  }
  for (const seed of seeds) await ensureStaffAssignment(prisma, org, staffIds, seed);
}
