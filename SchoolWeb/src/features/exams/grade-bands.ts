// Bands are whole percents, contiguous (next.min = previous.max + 1) and cover 0–100.

export interface BandRange {
  min: number;
  max: number;
}

export interface BandCoverage {
  /** Problem per row index (the row as shown in the editor). */
  rows: Record<number, string>;
  /** Problem that is not tied to one row (missing 0 or 100). */
  general: string | null;
}

function parsePercent(text: string): number | null {
  const value = text.trim();
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed <= 100 ? parsed : null;
}

export function bandRange(min: string, max: string): BandRange | null {
  const low = parsePercent(min);
  const high = parsePercent(max);
  return low === null || high === null || low > high ? null : { min: low, max: high };
}

function addIssue(rows: Record<number, string>, index: number, message: string) {
  if (!rows[index]) rows[index] = message;
}

/** Which rows overlap, leave a gap, or are not valid ranges. */
export function checkBandCoverage(bands: { minPercent: string; maxPercent: string }[]): BandCoverage {
  const rows: Record<number, string> = {};
  const ranges: (BandRange & { index: number })[] = [];

  bands.forEach((band, index) => {
    const range = bandRange(band.minPercent, band.maxPercent);
    if (range) ranges.push({ ...range, index });
    else addIssue(rows, index, "Use whole percents from 0 to 100, with min not above max");
  });
  if (ranges.length === 0) return { rows, general: bands.length ? null : "Add at least one band" };

  ranges.sort((a, b) => a.min - b.min || a.max - b.max);
  for (let i = 1; i < ranges.length; i += 1) {
    const previous = ranges[i - 1];
    const current = ranges[i];
    if (current.min <= previous.max) {
      addIssue(rows, current.index, `Overlaps ${previous.min}–${previous.max}%`);
      addIssue(rows, previous.index, `Overlaps ${current.min}–${current.max}%`);
    } else if (current.min > previous.max + 1) {
      const gap = `Gap from ${previous.max + 1} to ${current.min - 1}%`;
      addIssue(rows, previous.index, gap);
      addIssue(rows, current.index, gap);
    }
  }

  const missing: string[] = [];
  if (ranges[0].min > 0) missing.push(`0–${ranges[0].min - 1}%`);
  const top = Math.max(...ranges.map((range) => range.max));
  if (top < 100) missing.push(`${top + 1}–100%`);
  return { rows, general: missing.length ? `No band covers ${missing.join(" and ")}` : null };
}

export function hasCoverageIssues(coverage: BandCoverage): boolean {
  return !!coverage.general || Object.keys(coverage.rows).length > 0;
}
