import type { HintedOption } from "@/components/shared/select-option";
import type { TeachingStaff } from "@/features/classes/setup-types";
import { loadLabel } from "@/features/classes/teaching-staff-api";
import type { BuilderLesson, BusyEntry, TimetableBuilder } from "./builder-types";
import type { Ref } from "./types";

/** "English — 2 left", "English — 6/6 done", or "English — 4 placed" when there is no weekly target. */
export function lessonHint(lesson: BuilderLesson): string {
  const target = lesson.periodsPerWeek;
  if (!target) return `${lesson.placed} placed`;
  const left = target - lesson.placed;
  if (left > 0) return `${left} left`;
  return left === 0 ? `${target}/${target} done` : `${lesson.placed}/${target}, over`;
}

export const subjectOptions = (lessons: BuilderLesson[]): HintedOption[] =>
  lessons.map((lesson) => ({
    id: lesson.subject.id,
    name: lesson.subject.name,
    hint: lessonHint(lesson),
    muted: !!lesson.periodsPerWeek && lesson.placed >= lesson.periodsPerWeek,
  }));

/**
 * The subject's teacher first ("teaches English here"), then free teachers, then busy ones
 * ("busy: Class 8 B", still selectable). Each shows their load.
 */
export function staffOptions(
  staff: TeachingStaff[],
  lesson: BuilderLesson | undefined,
  busyNow: BusyEntry[],
  current: Ref | null | undefined,
): HintedOption[] {
  const busyIn = (id: string) => busyNow.find((entry) => entry.staffId === id)?.sectionName;
  const rank = (member: TeachingStaff) => (member.id === lesson?.teacher?.id ? 0 : busyIn(member.id) ? 2 : 1);
  const options: HintedOption[] = [...staff]
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    .map((member) => {
      const busy = busyIn(member.id);
      const tag = member.id === lesson?.teacher?.id ? `teaches ${lesson.subject.name} here` : busy ? `busy: ${busy}` : null;
      const load = member.allocatedPeriods < 0 ? null : loadLabel(member);
      return { id: member.id, name: member.name, hint: [tag, load].filter(Boolean).join(" · "), muted: !!busy };
    });
  if (current && !options.some((option) => option.id === current.id)) options.push({ id: current.id, name: current.name });
  return options;
}

/** Allocated teachers of the section's subjects, without load (used when the staff list is not available). */
export function lessonTeachers(builder: TimetableBuilder): TeachingStaff[] {
  const seen = new Map<string, TeachingStaff>();
  for (const { teacher } of builder.lessons) {
    if (teacher && !seen.has(teacher.id)) {
      seen.set(teacher.id, { ...teacher, designation: "", hasLogin: true, allocatedPeriods: -1, placedPeriods: 0, sections: 0 });
    }
  }
  return [...seen.values()];
}
