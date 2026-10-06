import { phoneVariants } from '../../validation/fields';
import type { Db, ImportTarget } from '../kind-handler';

interface GuardianRef {
  id: string;
  userId: string | null;
}

export interface GuardianContext {
  /** admissionNo → student enrolled (ACTIVE) in the import's branch */
  students: Map<
    string,
    { id: string; hasPrimary: boolean; guardianIds: Set<string> }
  >;
  findGuardian(cnic: string | null, phone: string | null): GuardianRef | null;
  usersByPhone: Map<string, string>;
  usersByEmail: Map<string, string>;
  /** userId → guardian id holding that login */
  guardianByUser: Map<string, string>;
}

interface Wanted {
  admissionNo?: string;
  phone?: string;
  cnic?: string | null;
  email?: string | null;
}

export async function loadGuardianContext(
  db: Db,
  target: ImportTarget,
  rows: Wanted[],
): Promise<GuardianContext> {
  const admissionNos = [...new Set(rows.flatMap((r) => r.admissionNo ?? []))];
  const phones = rows.flatMap((r) => (r.phone ? phoneVariants(r.phone) : []));
  const cnics = rows.flatMap((r) => r.cnic ?? []);
  const emails = rows.flatMap((r) => r.email ?? []);
  const [students, guardians, users] = await Promise.all([
    db.student.findMany({
      where: {
        schoolId: target.schoolId,
        admissionNo: { in: admissionNos },
        enrollments: { some: { branchId: target.branchId, status: 'ACTIVE' } },
      },
      select: {
        id: true,
        admissionNo: true,
        guardianLinks: {
          where: { status: { in: ['REQUESTED', 'VERIFIED'] } },
          select: { guardianId: true, isPrimary: true, status: true },
        },
      },
    }),
    db.guardian.findMany({
      where: {
        schoolId: target.schoolId,
        status: 'ACTIVE',
        OR: [{ phone: { in: phones } }, { cnic: { in: cnics } }],
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, userId: true, phone: true, cnic: true },
    }),
    db.user.findMany({
      where: { OR: [{ phone: { in: phones } }, { email: { in: emails } }] },
      select: {
        id: true,
        phone: true,
        email: true,
        guardianProfile: { select: { id: true } },
      },
    }),
  ]);
  const byCnic = new Map<string, GuardianRef>();
  const byPhone = new Map<string, GuardianRef>();
  for (const g of guardians) {
    if (g.cnic && !byCnic.has(g.cnic)) byCnic.set(g.cnic, g);
    if (!byPhone.has(g.phone)) byPhone.set(g.phone, g);
  }
  return {
    students: new Map(
      students.map((s) => [
        s.admissionNo,
        {
          id: s.id,
          hasPrimary: s.guardianLinks.some(
            (l) => l.isPrimary && l.status === 'VERIFIED',
          ),
          guardianIds: new Set(s.guardianLinks.map((l) => l.guardianId)),
        },
      ]),
    ),
    findGuardian(cnic, phone) {
      if (cnic && byCnic.has(cnic)) return byCnic.get(cnic)!;
      for (const variant of phone ? phoneVariants(phone) : []) {
        const found = byPhone.get(variant);
        if (found) return found;
      }
      return null;
    },
    usersByPhone: new Map(
      users.flatMap((u) => (u.phone ? [[u.phone, u.id]] : [])),
    ),
    usersByEmail: new Map(
      users.flatMap((u) => (u.email ? [[u.email, u.id]] : [])),
    ),
    guardianByUser: new Map(
      users.flatMap((u) =>
        u.guardianProfile ? [[u.id, u.guardianProfile.id]] : [],
      ),
    ),
  };
}
