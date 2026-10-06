export interface ClassLevel {
  id: string;
  levelOrder: number;
}

export interface SectionOption {
  id: string;
  classId: string;
  name: string;
}

/** The class with the next higher levelOrder, if any. */
export function nextClass<T extends ClassLevel>(
  classes: readonly T[],
  classId: string,
): T | null {
  const current = classes.find((c) => c.id === classId);
  if (!current) return null;
  return (
    [...classes]
      .filter((c) => c.levelOrder > current.levelOrder)
      .sort((a, b) => a.levelOrder - b.levelOrder)[0] ?? null
  );
}

export function isLastClass(
  classes: readonly ClassLevel[],
  classId: string,
): boolean {
  return nextClass(classes, classId) === null;
}

/**
 * New-session section: the chosen one (when it belongs to the target class),
 * else the section with the same name in the target class, else its first.
 */
export function resolveTargetSection(
  sections: readonly SectionOption[],
  target: {
    classId: string;
    toSectionId: string | null;
    fromSectionName: string;
  },
): SectionOption | null {
  const ofClass = sections
    .filter((s) => s.classId === target.classId)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (target.toSectionId)
    return ofClass.find((s) => s.id === target.toSectionId) ?? null;
  const sameName = ofClass.find(
    (s) =>
      s.name.trim().toLowerCase() ===
      target.fromSectionName.trim().toLowerCase(),
  );
  return sameName ?? ofClass[0] ?? null;
}
