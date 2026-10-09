const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** DATE column (UTC midnight) → "Mon 12 Oct 2026". */
export function paperDate(date: Date): string {
  return `${DAYS[date.getUTCDay()].slice(0, 3)} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export const weekday = (date: Date) => DAYS[date.getUTCDay()];

/** "13:30" → "1:30 PM". */
export function time12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Date sheet rows: Date | Day | Time | Subject | Max | Pass | Room. */
export function dateSheetRows(
  papers: {
    date: Date;
    startTime: string;
    endTime: string;
    subjectId: string;
    maxMarks: number;
    passMarks: number;
    roomId: string | null;
  }[],
  subjects: Map<string, string>,
  rooms: Map<string, string>,
): string[][] {
  return [...papers]
    .sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        a.startTime.localeCompare(b.startTime),
    )
    .map((p) => [
      paperDate(p.date),
      weekday(p.date),
      `${time12(p.startTime)} – ${time12(p.endTime)}`,
      subjects.get(p.subjectId) ?? '',
      String(p.maxMarks),
      String(p.passMarks),
      p.roomId ? (rooms.get(p.roomId) ?? '') : '',
    ]);
}
