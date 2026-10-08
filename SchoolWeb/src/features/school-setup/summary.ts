import { weekdayLabels } from "@/components/shared/WeekdayPicker";
import { formatDate } from "@/lib/format";
import { formatTime, formatTimeRange } from "@/lib/time";
import { generateBell } from "@/features/timetable/bell-generator";
import { sectionsText } from "./class-rows";
import type { SetupFormValues } from "./schemas";

/** "1 school, 1 branch, principal account for X, session 2026-27, 13 classes, 8 subjects". */
export function creationSentence(values: SetupFormValues): string {
  const { principal, academics } = values;
  const parts = ["1 school", "1 branch", `principal account for ${principal.name.trim() || "the principal"}`];
  if (academics.createSession) {
    parts.push(`session ${academics.sessionName}`);
    const included = academics.classes.filter((row) => row.include);
    const subjects = new Set(included.flatMap((row) => row.subjects.map((subject) => subject.name)));
    if (included.length) parts.push(countOf(included.length, "class", "classes"));
    if (subjects.size) parts.push(countOf(subjects.size, "subject", "subjects"));
    parts.push("a bell schedule");
  }
  return parts.join(", ");
}

export function countOf(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export interface SummaryRow {
  label: string;
  value: string;
}

export function schoolRows({ school }: SetupFormValues): SummaryRow[] {
  return [
    { label: "Name", value: `${school.name} (${school.code.toUpperCase()})` },
    { label: "Contact", value: [school.phone, school.email].filter(Boolean).join(" · ") || "Not given" },
    ...(school.website ? [{ label: "Website", value: school.website }] : []),
    ...(school.address ? [{ label: "Address", value: school.address }] : []),
  ];
}

export function branchRows({ branch }: SetupFormValues): SummaryRow[] {
  return [
    { label: "Name", value: `${branch.name} (${branch.code.toUpperCase()})` },
    { label: "School hours", value: formatTimeRange(branch.opensAt, branch.closesAt) },
    { label: "Attendance locks", value: formatTime(branch.attendanceLockAt) },
    { label: "Working days", value: weekdayLabels(branch.workingDays) },
  ];
}

export function principalRows({ principal }: SetupFormValues): SummaryRow[] {
  return [
    { label: "Name", value: principal.name },
    { label: "Signs in with", value: [principal.email, principal.phone].filter(Boolean).join(" or ") },
    {
      label: "Password",
      value: principal.generatePassword
        ? "A temporary password is shown after creating; they change it at first sign-in"
        : "The password you set",
    },
  ];
}

export function academicRows({ academics }: SetupFormValues): SummaryRow[] {
  if (!academics.createSession) return [{ label: "Academic session", value: "Not now (the principal sets it up later)" }];
  return [
    {
      label: "Session",
      value: `${academics.sessionName} · ${formatDate(academics.startDate)} to ${formatDate(academics.endDate)}`,
    },
  ];
}

/** "Class 9 · A (Science), B (Arts) · 11 subjects", one row per ticked class. */
export function classRows({ academics }: SetupFormValues): SummaryRow[] {
  const included = academics.classes.filter((row) => row.include);
  if (included.length === 0) return [{ label: "Classes", value: "None" }];
  return included.map((row) => ({
    label: row.name,
    value: `${sectionsText(row.sections)} · ${countOf(row.subjects.length, "subject", "subjects")}`,
  }));
}

/** Periods per day and when the last bell rings (and on Friday, if it is shorter). */
export function bellRows({ bell, branch }: SetupFormValues): SummaryRow[] {
  const day = generateBell(bell);
  const rows: SummaryRow[] = [
    {
      label: "Every day",
      value: `${countOf(bell.periodsPerDay, "period", "periods")} of ${bell.periodMinutes} min, ${formatTime(day[0]?.startTime)} to ${formatTime(day.at(-1)?.endTime)}`,
    },
  ];
  if (bell.shortFriday && branch.workingDays.includes(5)) {
    const friday = generateBell({ ...bell, ...bell.friday });
    rows.push({
      label: "Friday",
      value: `${countOf(bell.friday.periodsPerDay, "period", "periods")} of ${bell.friday.periodMinutes} min, ends ${formatTime(friday.at(-1)?.endTime)}`,
    });
  }
  return rows;
}
