import type { BellSchedule } from "@/features/timetable/builder-types";
import type { Period } from "@/features/timetable/types";
import type { ClassSubjectItem } from "../setup-types";

const teaching = (rows: Period[]) => rows.filter((row) => !row.isBreak).length;

/** Teaching periods in a week: each working day uses its own schedule when it has one. */
export function teachingPeriodsPerWeek(bell: BellSchedule | null): number | null {
  if (!bell || bell.default.length === 0) return null;
  return bell.workingDays.reduce((sum, day) => sum + teaching(bell.days[String(day)] ?? bell.default), 0);
}

export interface PlannedLine {
  /** null = sections without a group. */
  group: string | null;
  planned: number;
}

/** Σ periods/week a section of each group will need (group-less subjects count for every section). */
export function plannedByGroup(subjects: ClassSubjectItem[], groups: string[]): PlannedLine[] {
  const sum = (group: string | null) =>
    subjects
      .filter((subject) => subject.group === null || subject.group === group)
      .reduce((total, subject) => total + (subject.periodsPerWeek ?? 0), 0);
  if (groups.length === 0) return [{ group: null, planned: sum(null) }];
  return groups.map((group) => ({ group, planned: sum(group) }));
}
