import type { Option } from "@/components/shared/OptionSelect";
import type { PersonRef } from "@/features/people/types";
import type { SectionStaff } from "@/features/staff/types";

/**
 * Teachers assigned to this section/subject come first and are marked; the rest of the branch's
 * teachers follow. The current value is kept even if the teacher is no longer in either list.
 */
export function teacherOptions(
  sectionStaff: SectionStaff | undefined,
  subjectId: string,
  branchTeachers: Option[],
  current: PersonRef | undefined,
): Option[] {
  const result: Option[] = [];
  const seen = new Set<string>();
  const add = (id: string, name: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    result.push({ id, name });
  };
  for (const entry of sectionStaff?.subjectTeachers ?? []) {
    if (entry.subject.id === subjectId) add(entry.staff.id, `${entry.staff.name} (teaches ${entry.subject.name} here)`);
  }
  if (sectionStaff?.classTeacher) add(sectionStaff.classTeacher.id, `${sectionStaff.classTeacher.name} (class teacher)`);
  for (const entry of sectionStaff?.subjectTeachers ?? []) add(entry.staff.id, `${entry.staff.name} (teaches this section)`);
  for (const option of branchTeachers) add(option.id, option.name);
  if (current) add(current.id, current.name);
  return result;
}

/** Strips the "(…)" hint added above so the cell shows the plain name. */
export function plainName(options: Option[], id: string): string {
  const name = options.find((option) => option.id === id)?.name ?? "";
  return name.replace(/\s\([^)]*\)$/, "");
}

export function withCurrent(options: Option[], current: PersonRef | null | undefined): Option[] {
  return current && !options.some((option) => option.id === current.id) ? [...options, current] : options;
}
