/** Section/subject groups ("Science", "Arts"); blank = no group. */
export function normalizeGroup(group?: string | null): string | null {
  const trimmed = group?.trim();
  return trimmed ? trimmed : null;
}

export const sameGroup = (a?: string | null, b?: string | null) =>
  (normalizeGroup(a) ?? '').toLowerCase() ===
  (normalizeGroup(b) ?? '').toLowerCase();

/** A class subject without a group is taught in every section; otherwise only in that group. */
export function appliesTo(
  subjectGroup: string | null | undefined,
  sectionGroup: string | null | undefined,
): boolean {
  return !normalizeGroup(subjectGroup) || sameGroup(subjectGroup, sectionGroup);
}
