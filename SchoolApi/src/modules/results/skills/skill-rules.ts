import type { SkillDomain } from '../../../generated/prisma/client';

export interface ItemInput {
  id?: string;
  domain: SkillDomain;
  name: string;
}

export interface LevelInput {
  value: number;
  code: string;
  label: string;
}

export interface RatingInput {
  studentId: string;
  itemId: string;
  value: number | null;
}

const key = (domain: string, name: string) =>
  `${domain}:${name.trim().toLowerCase()}`;

/** Problems in a branch skill config (empty = valid). */
export function configProblems(
  items: ItemInput[],
  scale: LevelInput[],
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const k = key(item.domain, item.name);
    if (seen.has(k)) problems.push(`"${item.name.trim()}" is listed twice`);
    seen.add(k);
  }
  const values = scale.map((l) => l.value).sort((a, b) => a - b);
  if (values.some((v, i) => v !== i + 1))
    problems.push('Scale values must run 1, 2, 3… without gaps');
  const codes = new Set(scale.map((l) => l.code.trim().toUpperCase()));
  if (codes.size !== scale.length) problems.push('Scale codes must differ');
  return problems;
}

/** Sort order per domain, in list order. */
export function withSortOrder<T extends ItemInput>(
  items: T[],
): (T & { sortOrder: number })[] {
  const counters = new Map<string, number>();
  return items.map((item) => {
    const next = (counters.get(item.domain) ?? 0) + 1;
    counters.set(item.domain, next);
    return { ...item, name: item.name.trim(), sortOrder: next };
  });
}

/** Problems in a ratings batch against the roster, items and scale. */
export function ratingProblems(
  ratings: RatingInput[],
  studentIds: Set<string>,
  itemIds: Set<string>,
  maxValue: number,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const r of ratings) {
    const k = `${r.studentId}:${r.itemId}`;
    if (seen.has(k)) problems.push(`Duplicate rating ${k}`);
    seen.add(k);
    if (!studentIds.has(r.studentId))
      problems.push(`Student ${r.studentId} is not in this section`);
    if (!itemIds.has(r.itemId))
      problems.push(`Item ${r.itemId} is not an active skill`);
    if (r.value !== null && (r.value < 1 || r.value > maxValue))
      problems.push(`Rating must be between 1 and ${maxValue}`);
  }
  return [...new Set(problems)];
}

/** Students whose every item is rated. */
export function completeCount(
  ratings: Map<string, Record<string, number>>,
  itemIds: string[],
): number {
  if (itemIds.length === 0) return 0;
  let count = 0;
  for (const row of ratings.values())
    if (itemIds.every((id) => row[id] !== undefined)) count += 1;
  return count;
}
