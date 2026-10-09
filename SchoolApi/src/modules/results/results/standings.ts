import { rankByPercent } from './result-calculator';

export interface StandingInput {
  studentId: string;
  sectionId: string;
  classId: string;
  percentH: number;
}

export interface Standing {
  /** Students with a result in the same section. */
  sectionSize: number;
  /** Rank among all sections of the class ("1, 2, 2, 4"). */
  classPosition: number;
  classSize: number;
}

/** Section sizes and class-wide ranks of one exam's results. */
export function standingsOf(rows: StandingInput[]): Map<string, Standing> {
  const sectionSize = new Map<string, number>();
  const byClass = new Map<string, StandingInput[]>();
  for (const row of rows) {
    sectionSize.set(row.sectionId, (sectionSize.get(row.sectionId) ?? 0) + 1);
    byClass.set(row.classId, [...(byClass.get(row.classId) ?? []), row]);
  }
  const map = new Map<string, Standing>();
  for (const list of byClass.values()) {
    const ranks = rankByPercent(
      list.map((r) => ({ id: r.studentId, percentH: r.percentH })),
    );
    for (const row of list)
      map.set(row.studentId, {
        sectionSize: sectionSize.get(row.sectionId) ?? 0,
        classPosition: ranks.get(row.studentId) ?? 0,
        classSize: list.length,
      });
  }
  return map;
}

/** "3rd", "11th", "22nd". */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/** "3rd of 32" (or "-" when positions are off). */
export function positionText(position: number | null, size: number): string {
  return position === null ? '-' : `${ordinal(position)} of ${size}`;
}
