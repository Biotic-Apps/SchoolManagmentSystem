import { phoneVariants } from '../../validation/fields';
import type { Db, ImportTarget } from '../kind-handler';
import { loadAcademicRefs, type AcademicRefs } from '../shared/academic-refs';

export interface StaffContext {
  refs: AcademicRefs;
  /** code → subject id */
  subjects: Map<string, string>;
  /** `${classId}|${subjectId}` taught */
  classSubjects: Set<string>;
  /** section ids with an active class teacher */
  classTeacherSections: Set<string>;
  /** `${sectionId}|${subjectId}` with an active (non-substitute) teacher */
  subjectTeachers: Set<string>;
  staffCnics: Set<string>;
  staffPhones: Set<string>;
  usersByPhone: Map<string, { id: string; hasStaff: boolean }>;
  usersByEmail: Map<string, { id: string; hasStaff: boolean }>;
}

interface Wanted {
  phone?: string;
  cnic?: string;
  email?: string | null;
}

export async function loadStaffContext(
  db: Db,
  target: ImportTarget,
  rows: Wanted[],
): Promise<StaffContext> {
  const phones = rows.flatMap((r) => (r.phone ? phoneVariants(r.phone) : []));
  const cnics = rows.flatMap((r) =>
    r.cnic ? [r.cnic, r.cnic.replace(/-/g, '')] : [],
  );
  const emails = rows.flatMap((r) => r.email ?? []);
  const [refs, subjects, classSubjects, assignments, staff, users] =
    await Promise.all([
      loadAcademicRefs(db, target.schoolId, target.sessionId),
      db.subject.findMany({
        where: { schoolId: target.schoolId, status: 'ACTIVE' },
        select: { id: true, code: true },
      }),
      db.classSubject.findMany({
        where: { schoolId: target.schoolId, status: 'ACTIVE' },
        select: { classId: true, subjectId: true },
      }),
      db.staffAssignment.findMany({
        where: {
          sessionId: target.sessionId,
          endedAt: null,
          kind: { in: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
        },
        select: {
          kind: true,
          sectionId: true,
          subjectId: true,
          isSubstitute: true,
        },
      }),
      db.staff.findMany({
        where: {
          schoolId: target.schoolId,
          OR: [{ cnic: { in: cnics } }, { phone: { in: phones } }],
        },
        select: { cnic: true, phone: true },
      }),
      db.user.findMany({
        where: { OR: [{ phone: { in: phones } }, { email: { in: emails } }] },
        select: {
          id: true,
          phone: true,
          email: true,
          staffProfile: { select: { id: true } },
        },
      }),
    ]);
  const user = (u: (typeof users)[number]) => ({
    id: u.id,
    hasStaff: !!u.staffProfile,
  });
  return {
    refs,
    subjects: new Map(subjects.map((s) => [s.code.toUpperCase(), s.id])),
    classSubjects: new Set(
      classSubjects.map((c) => `${c.classId}|${c.subjectId}`),
    ),
    classTeacherSections: new Set(
      assignments.flatMap((a) =>
        a.kind === 'CLASS_TEACHER' && a.sectionId ? [a.sectionId] : [],
      ),
    ),
    subjectTeachers: new Set(
      assignments.flatMap((a) =>
        a.kind === 'SUBJECT_TEACHER' && !a.isSubstitute
          ? [`${a.sectionId}|${a.subjectId}`]
          : [],
      ),
    ),
    staffCnics: new Set(staff.flatMap((s) => s.cnic?.replace(/-/g, '') ?? [])),
    staffPhones: new Set(staff.flatMap((s) => s.phone ?? [])),
    usersByPhone: new Map(
      users.flatMap((u) => (u.phone ? [[u.phone, user(u)]] : [])),
    ),
    usersByEmail: new Map(
      users.flatMap((u) => (u.email ? [[u.email, user(u)]] : [])),
    ),
  };
}
