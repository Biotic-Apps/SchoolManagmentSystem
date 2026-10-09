export interface PrintSection {
  id: string;
  classId: string;
  name: string;
  /** Caller may read this section (manager or a teacher there). */
  readable: boolean;
}

export interface PrintRequest {
  sectionId?: string;
  classId?: string;
}

export type PrintTargets =
  | { ok: true; sectionIds: string[]; classIds: string[] }
  | { ok: false; reason: 'invalid' | 'forbidden' | 'empty'; message: string };

/**
 * Sections/classes a print covers. `sectionId` wins over `classId`; neither
 * means every exam class. Unreadable sections are left out of class-wide
 * prints, but naming one directly is forbidden. `sections` come in class
 * order, then by name.
 */
export function printTargets(
  examClassIds: string[],
  sections: PrintSection[],
  request: PrintRequest,
): PrintTargets {
  if (request.sectionId) {
    const section = sections.find((s) => s.id === request.sectionId);
    if (!section)
      return {
        ok: false,
        reason: 'invalid',
        message: 'This section does not sit this exam',
      };
    if (!section.readable)
      return { ok: false, reason: 'forbidden', message: 'Outside your scope' };
    return { ok: true, sectionIds: [section.id], classIds: [section.classId] };
  }
  if (request.classId && !examClassIds.includes(request.classId))
    return {
      ok: false,
      reason: 'invalid',
      message: 'This class does not sit this exam',
    };
  const classIds = request.classId ? [request.classId] : examClassIds;
  const chosen = sections.filter(
    (s) => s.readable && classIds.includes(s.classId),
  );
  if (chosen.length === 0)
    return {
      ok: false,
      reason: 'forbidden',
      message: 'No sections of yours sit this exam',
    };
  const reachedClasses = classIds.filter((id) =>
    chosen.some((s) => s.classId === id),
  );
  return {
    ok: true,
    sectionIds: chosen.map((s) => s.id),
    classIds: reachedClasses,
  };
}
