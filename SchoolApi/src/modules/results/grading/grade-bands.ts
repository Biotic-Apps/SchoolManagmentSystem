export interface BandRange {
  grade: string;
  minPercent: number;
  maxPercent: number;
}

/**
 * Whole-percent bands must cover 0–100 contiguously without overlap
 * (next.min = prev.max + 1). Returns the problems found (empty = valid).
 */
export function bandProblems(bands: readonly BandRange[]): string[] {
  const problems: string[] = [];
  if (bands.length === 0) return ['At least one band is required'];
  const grades = new Set<string>();
  for (const band of bands) {
    const key = band.grade.trim().toUpperCase();
    if (grades.has(key)) problems.push(`Grade ${band.grade} is repeated`);
    grades.add(key);
    if (
      !Number.isInteger(band.minPercent) ||
      !Number.isInteger(band.maxPercent)
    )
      problems.push(`Grade ${band.grade}: percents must be whole numbers`);
    if (band.minPercent < 0 || band.maxPercent > 100)
      problems.push(`Grade ${band.grade}: percents must be within 0–100`);
    if (band.minPercent > band.maxPercent)
      problems.push(`Grade ${band.grade}: min is above max`);
  }
  if (problems.length > 0) return problems;
  const sorted = sortBands(bands);
  if (sorted[0].minPercent !== 0) problems.push('Bands must start at 0');
  if (sorted[sorted.length - 1].maxPercent !== 100)
    problems.push('Bands must end at 100');
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (next.minPercent <= prev.maxPercent)
      problems.push(`Grades ${prev.grade} and ${next.grade} overlap`);
    else if (next.minPercent !== prev.maxPercent + 1)
      problems.push(`Gap between ${prev.grade} and ${next.grade}`);
  }
  return problems;
}

export function sortBands<T extends BandRange>(bands: readonly T[]): T[] {
  return [...bands].sort((a, b) => a.minPercent - b.minPercent);
}

/** Band containing a whole percent (callers pass floor(percent)). */
export function bandFor<T extends BandRange>(
  bands: readonly T[],
  wholePercent: number,
): T | null {
  const value = Math.max(0, Math.min(100, wholePercent));
  return (
    bands.find((b) => value >= b.minPercent && value <= b.maxPercent) ?? null
  );
}
