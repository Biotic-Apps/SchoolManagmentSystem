import { toIsoDate } from "@/lib/dates";

/** Contract presets; the principal can edit them later. */
export const STANDARD_CLASSES = [
  "Playgroup",
  "Nursery",
  "Prep",
  ...Array.from({ length: 10 }, (_, i) => `Class ${i + 1}`),
];

export const STANDARD_SUBJECTS = [
  "English",
  "Urdu",
  "Mathematics",
  "General Science",
  "Islamiat",
  "Social Studies",
  "Computer Science",
  "Nazra Quran",
];

export const SECTION_LETTERS = ["A", "B", "C", "D"];

export const DEFAULT_TIMINGS = { opensAt: "08:00", closesAt: "14:00", attendanceLockAt: "10:00" };
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5, 6];

const KARACHI = "Asia/Karachi";

function karachiToday(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: KARACHI, year: "numeric", month: "numeric" }).formatToParts(
    new Date(),
  );
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month") };
}

/** 1 April of the current school year → 31 March next year (Asia/Karachi). */
export function defaultSessionDates(): { startDate: string; endDate: string } {
  const { year, month } = karachiToday();
  const startYear = month >= 4 ? year : year - 1;
  return {
    startDate: toIsoDate(new Date(startYear, 3, 1)),
    endDate: toIsoDate(new Date(startYear + 1, 2, 31)),
  };
}

/** "2026-04-01" + "2027-03-31" → "2026-27"; same year → "2026". */
export function sessionNameFor(startDate: string, endDate: string): string {
  const start = startDate.slice(0, 4);
  const end = endDate.slice(0, 4);
  if (!/^\d{4}$/.test(start)) return "";
  if (!/^\d{4}$/.test(end) || end === start) return start;
  return `${start}-${end.slice(2)}`;
}

export function sectionLabel(count: number): string {
  return SECTION_LETTERS.slice(0, count).join(", ");
}

export const CLASS_GROUPS = [
  { label: "Early years", options: STANDARD_CLASSES.slice(0, 3) },
  { label: "Primary", options: STANDARD_CLASSES.slice(3, 8) },
  { label: "Secondary", options: STANDARD_CLASSES.slice(8) },
];

export const SUBJECT_GROUPS = [{ options: STANDARD_SUBJECTS }];

/** "Each class gets section A" / "Each class gets sections A, B and C". */
export function sectionsHint(count: number): string {
  const letters = SECTION_LETTERS.slice(0, count);
  if (letters.length === 1) return `Each class gets section ${letters[0]}`;
  return `Each class gets sections ${letters.slice(0, -1).join(", ")} and ${letters[letters.length - 1]}`;
}
