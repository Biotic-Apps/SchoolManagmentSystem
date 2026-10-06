import type { Db } from '../kind-handler';

/** "5", "Class 5", "class 5" → "class 5" (class names are `Class N`). */
export function classKey(raw: string): string {
  const value = raw.replace(/\s+/g, ' ').trim().toLowerCase();
  return /^\d+$/.test(value) ? `class ${value}` : value;
}

export const sectionKey = (classRef: string, section: string) =>
  `${classKey(classRef)}|${section.trim().toLowerCase()}`;

/** "5-A" / "Class 5-A" → { classRef, section } (split at the last dash). */
export function splitSectionRef(
  raw: string,
): { classRef: string; section: string } | null {
  const at = raw.lastIndexOf('-');
  if (at <= 0 || at === raw.length - 1) return null;
  return {
    classRef: raw.slice(0, at).trim(),
    section: raw.slice(at + 1).trim(),
  };
}

export interface SectionRef {
  id: string;
  classId: string;
  label: string;
  capacity: number | null;
  rollNos: Set<number>;
  active: number;
}

export interface AcademicRefs {
  /** classKey → class id */
  classes: Map<string, { id: string; name: string }>;
  /** sectionKey → section of the import's session */
  sections: Map<string, SectionRef>;
}

/** Active classes of the school and active sections of the session. */
export async function loadAcademicRefs(
  db: Db,
  schoolId: string,
  sessionId: string,
): Promise<AcademicRefs> {
  const [classes, sections] = await Promise.all([
    db.schoolClass.findMany({
      where: { schoolId, status: 'ACTIVE' },
      select: { id: true, name: true },
    }),
    db.section.findMany({
      where: { sessionId, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        classId: true,
        capacity: true,
        schoolClass: { select: { name: true } },
        enrollments: {
          where: { status: 'ACTIVE' },
          select: { rollNo: true },
        },
      },
    }),
  ]);
  return {
    classes: new Map(classes.map((c) => [classKey(c.name), c])),
    sections: new Map(
      sections.map((s) => [
        sectionKey(s.schoolClass.name, s.name),
        {
          id: s.id,
          classId: s.classId,
          label: `${s.schoolClass.name}-${s.name}`,
          capacity: s.capacity,
          rollNos: new Set(
            s.enrollments
              .map((e) => e.rollNo)
              .filter((n): n is number => n !== null),
          ),
          active: s.enrollments.length,
        },
      ]),
    ),
  };
}
