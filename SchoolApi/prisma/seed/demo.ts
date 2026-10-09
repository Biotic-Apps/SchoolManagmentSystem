import { RoleKey } from '../../src/core/rbac/role-key.enum';
import type { SeedClient } from './client';
import { seedAcademics } from './demo-academics';
import { seedAdmissions } from './demo-admissions';
import { seedUpcomingCalendar } from './demo-calendar';
import { loadOrg, seedStudents } from './demo-people';
import { seedAssignments, seedStaff } from './demo-staff';
import { seedPeriods, seedTimetables } from './demo-timetable';
import { seedDailyOperations } from './demo-daily';
import { seedOrganisation } from './demo-org';
import { seedFinanceAndResults } from './demo-phase4';
import { seedSchoolSettings } from './demo-settings';
import type { SystemRoleIds } from './system-roles';
import { ensureAssignment, ensureUser } from './users';

const PASSWORD = 'Demo@1234';
const PARENT_PHONE = '+923001112233';

const BRANCH_STAFF = [
  ['principal@eschool.local', 'Demo Principal', RoleKey.PRINCIPAL],
  ['coordinator@eschool.local', 'Demo Coordinator', RoleKey.COORDINATOR],
  ['headteacher@eschool.local', 'Demo Head Teacher', RoleKey.HEAD_TEACHER],
  ['teacher@eschool.local', 'Demo Teacher', RoleKey.TEACHER],
  ['accountant@eschool.local', 'Demo Accountant', RoleKey.ACCOUNTANT],
  ['teacher2@eschool.local', 'Sana Teacher', RoleKey.TEACHER],
  ['teacher3@eschool.local', 'Imran Teacher', RoleKey.TEACHER],
  ['newteacher@eschool.local', 'New Teacher', RoleKey.TEACHER],
  ['helper@eschool.local', 'Demo Helper', RoleKey.HELPER],
] as const;

/** Phase 1 §14 accounts, Phase 2 §9 people/academics, Phase 3 daily operations, Phase 4 finance/results, Phase 6 calendar + parent phone (dev only). */
export async function seedDemo(prisma: SeedClient, roles: SystemRoleIds): Promise<void> {
  const org = await seedOrganisation(prisma);
  await seedAcademics(prisma, org);
  await seedSchoolSettings(prisma, org.school.id);
  const place = { schoolId: org.school.id, branchId: org.branch.id };

  const admin = await ensureUser(prisma, { email: 'admin@eschool.local', name: 'Demo Admin', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: admin.id, roleId: roles.SUPER_ADMIN, scopeType: 'GLOBAL' });

  for (const [email, name, role] of BRANCH_STAFF) {
    const user = await ensureUser(prisma, { email, name, password: PASSWORD, resetPassword: true });
    await ensureAssignment(prisma, { userId: user.id, roleId: roles[role], scopeType: 'BRANCH', ...place });
    if (role === RoleKey.PRINCIPAL) {
      await prisma.branch.update({ where: { id: org.branch.id }, data: { principalUserId: user.id } });
    }
  }

  const parent = await ensureUser(prisma, { email: 'parent@eschool.local', name: 'Demo Parent', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: parent.id, roleId: roles.PARENT, scopeType: 'GUARDIAN', schoolId: org.school.id });
  // Phase 6: phone number on the parent account (same number as the guardian record).
  await prisma.user.update({ where: { id: parent.id }, data: { phone: PARENT_PHONE } });

  const both = await ensureUser(prisma, { email: 'teacherparent@eschool.local', name: 'Demo Teacher Parent', password: PASSWORD, resetPassword: true });
  await ensureAssignment(prisma, { userId: both.id, roleId: roles.TEACHER, scopeType: 'BRANCH', ...place });
  await ensureAssignment(prisma, { userId: both.id, roleId: roles.PARENT, scopeType: 'GUARDIAN', schoolId: org.school.id });

  const ids = { schoolId: org.school.id, branchId: org.branch.id, sessionId: org.session.id };
  const people = await loadOrg(prisma, ids);
  const staffIds = await seedStaff(prisma, people);
  await seedAssignments(prisma, people, staffIds);
  await seedStudents(prisma, people);
  await seedPeriods(prisma, people);
  await seedTimetables(prisma, people, staffIds);
  await seedAdmissions(prisma, people);
  await seedDailyOperations(prisma, people);
  await seedFinanceAndResults(prisma, people);
  await seedUpcomingCalendar(prisma, ids);
}
