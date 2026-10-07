import { weekdayLabels } from "@/components/shared/WeekdayPicker";
import { formatDate } from "@/lib/format";
import { formatTime, formatTimeRange } from "@/lib/time";
import { sectionLabel } from "./presets";
import type { SetupFormValues } from "./schemas";

/** "1 school, 1 branch, principal account for X, session 2026-27, 13 classes, 8 subjects". */
export function creationSentence(values: SetupFormValues): string {
  const { principal, academics } = values;
  const parts = ["1 school", "1 branch", `principal account for ${principal.name.trim() || "the principal"}`];
  if (academics.createSession) {
    parts.push(`session ${academics.sessionName}`);
    if (academics.classes.length) parts.push(countOf(academics.classes.length, "class", "classes"));
    if (academics.subjects.length) parts.push(countOf(academics.subjects.length, "subject", "subjects"));
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
  const sections = Number(academics.sectionsPerClass);
  return [
    {
      label: "Session",
      value: `${academics.sessionName} · ${formatDate(academics.startDate)} to ${formatDate(academics.endDate)}`,
    },
    { label: "Classes", value: academics.classes.join(", ") || "None" },
    { label: "Sections", value: `${countOf(sections, "section", "sections")} per class (${sectionLabel(sections)})` },
    { label: "Subjects", value: academics.subjects.join(", ") || "None" },
  ];
}
