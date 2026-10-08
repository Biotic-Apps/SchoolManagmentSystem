import {
  SEVERITY,
  type BusySlot,
  type Conflict,
  type ConflictInput,
  type PlannedSlot,
} from './conflict-types';

const byCell = (a: PlannedSlot, b: PlannedSlot) =>
  a.day - b.day || a.periodIndex - b.periodIndex;

function warn(
  slot: { day: number; periodIndex: number },
  type:
    'WEEKLY_PERIODS_EXCEEDED' | 'WEEKLY_PERIODS_SHORT' | 'TEACHER_DAY_LIMIT',
  message: string,
): Conflict {
  return {
    type,
    severity: SEVERITY[type],
    day: slot.day,
    periodIndex: slot.periodIndex,
    message,
  };
}

/** placed vs periodsPerWeek per subject of the curriculum. */
function weeklyCounts(input: ConflictInput): Conflict[] {
  if (!input.curriculum) return [];
  const out: Conflict[] = [];
  for (const [subjectId, entry] of input.curriculum) {
    const target = entry.periodsPerWeek;
    if (target === null) continue;
    const placed = input.slots
      .filter((s) => s.subjectId === subjectId)
      .sort(byCell);
    for (const extra of placed.slice(target))
      out.push(
        warn(
          extra,
          'WEEKLY_PERIODS_EXCEEDED',
          `${entry.name}: ${placed.length} of ${target} periods a week placed`,
        ),
      );
    if (placed.length < target)
      out.push(
        warn(
          { day: 0, periodIndex: 0 },
          'WEEKLY_PERIODS_SHORT',
          `${entry.name}: ${placed.length} of ${target} periods a week placed`,
        ),
      );
  }
  return out;
}

/** Other sections' effective week: their draft when they have one, else published. */
function effectiveOthers(input: ConflictInput): BusySlot[] {
  const drafted = new Set((input.otherDrafts ?? []).map((s) => s.sectionId));
  return [
    ...(input.otherDrafts ?? []),
    ...input.others.filter((s) => !drafted.has(s.sectionId)),
  ];
}

/** A teacher over `maxPeriodsPerDay` lessons on a day across all sections. */
function dayLimit(input: ConflictInput): Conflict[] {
  const max = input.maxPeriodsPerDay;
  if (!max) return [];
  const load = new Map<string, number>();
  const key = (s: PlannedSlot) => `${s.staffId}@${s.day}`;
  for (const s of [...input.slots, ...effectiveOthers(input)])
    load.set(key(s), (load.get(key(s)) ?? 0) + 1);
  return input.slots
    .filter((s) => (load.get(key(s)) ?? 0) > max)
    .sort(byCell)
    .map((s) =>
      warn(
        s,
        'TEACHER_DAY_LIMIT',
        `Teacher has ${load.get(key(s))} lessons that day (limit ${max})`,
      ),
    );
}

export function weeklyConflicts(input: ConflictInput): Conflict[] {
  return [...weeklyCounts(input), ...dayLimit(input)];
}
