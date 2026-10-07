import { schoolDate } from '../../core/common/school-time';

export interface SessionDates {
  name: string;
  startDate: string;
  endDate: string;
}

/** School year runs 1 April – 31 March (Asia/Karachi calendar). */
export function defaultSessionDates(now = new Date()): SessionDates {
  const [year, month] = schoolDate(now).split('-').map(Number);
  const start = month >= 4 ? year : year - 1;
  return {
    name: sessionName(start, start + 1),
    startDate: `${start}-04-01`,
    endDate: `${start + 1}-03-31`,
  };
}

/** "2026-27" for 2026 → 2027; "2026" when both dates fall in one year. */
export function sessionName(startYear: number, endYear: number): string {
  if (startYear === endYear) return String(startYear);
  return `${startYear}-${String(endYear).slice(-2)}`;
}

/** Fills missing session fields from the defaults and the given dates. */
export function resolveSession(
  input: { sessionName?: string; startDate?: string; endDate?: string },
  now = new Date(),
): SessionDates {
  const fallback = defaultSessionDates(now);
  const startDate = input.startDate ?? fallback.startDate;
  const endDate =
    input.endDate ??
    (input.startDate ? oneYearLater(input.startDate) : fallback.endDate);
  const name =
    input.sessionName?.trim() ||
    sessionName(Number(startDate.slice(0, 4)), Number(endDate.slice(0, 4)));
  return { name, startDate, endDate };
}

/** The day before the same date next year ("2026-04-01" → "2027-03-31"). */
function oneYearLater(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
