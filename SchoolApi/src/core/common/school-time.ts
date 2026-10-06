/**
 * School wall-clock helpers. Business dates and times (attendance day, lock time, office hours)
 * follow the school's time zone, not the server's or UTC — Pakistan is UTC+5, so UTC "today"
 * is still yesterday until 05:00 local.
 */
export const SCHOOL_TIME_ZONE = process.env.APP_TIMEZONE || 'Asia/Karachi';

function parts(now: Date, timeZone: string): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value]),
  );
}

/** `YYYY-MM-DD` in the school's time zone. */
export function schoolDate(
  now = new Date(),
  timeZone = SCHOOL_TIME_ZONE,
): string {
  const p = parts(now, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

/** `HH:mm` (24-hour) in the school's time zone. */
export function schoolTime(
  now = new Date(),
  timeZone = SCHOOL_TIME_ZONE,
): string {
  const p = parts(now, timeZone);
  return `${p.hour}:${p.minute}`;
}

/** The instant at which the school's clock shows `date` `time`. */
export function schoolDateTime(
  date: string,
  time: string,
  timeZone = SCHOOL_TIME_ZONE,
): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const asUtc = Date.UTC(y, m - 1, d, hh, mm);
  const p = parts(new Date(asUtc), timeZone);
  const shown = Date.UTC(
    +p.year,
    +p.month - 1,
    +p.day,
    +p.hour,
    +p.minute,
    +p.second,
  );
  return new Date(asUtc - (shown - asUtc));
}
