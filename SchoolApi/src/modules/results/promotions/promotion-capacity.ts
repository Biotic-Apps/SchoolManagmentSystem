export interface SectionCapacity {
  id: string;
  /** null = unlimited. */
  capacity: number | null;
}

export interface CapacityProblem {
  sectionId: string;
  capacity: number;
  current: number;
  incoming: number;
}

/** Target sections whose active enrollments + incoming would exceed capacity. */
export function overCapacity(
  sections: readonly SectionCapacity[],
  current: ReadonlyMap<string, number>,
  incoming: ReadonlyMap<string, number>,
): CapacityProblem[] {
  const problems: CapacityProblem[] = [];
  for (const section of sections) {
    const adding = incoming.get(section.id) ?? 0;
    if (section.capacity === null || adding === 0) continue;
    const now = current.get(section.id) ?? 0;
    if (now + adding > section.capacity) {
      problems.push({
        sectionId: section.id,
        capacity: section.capacity,
        current: now,
        incoming: adding,
      });
    }
  }
  return problems;
}

export function countBy<T>(
  items: readonly T[],
  key: (item: T) => string | null,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    if (k !== null) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}
