import type { HintedOption } from "@/components/shared/select-option";
import type { Ref } from "@/features/timetable/types";
import { loadLabel } from "../teaching-staff-api";
import type { TeachingStaff } from "../setup-types";

/**
 * Teachers already teaching this class come first, then everyone else, each with their load.
 * A current teacher missing from the list (left, or not a teacher any more) is kept so the value still shows.
 */
export function teacherOptions(staff: TeachingStaff[], preferred: Set<string>, current?: Ref | null): HintedOption[] {
  const sorted = [...staff].sort((a, b) => {
    const rank = Number(preferred.has(b.id)) - Number(preferred.has(a.id));
    return rank || a.name.localeCompare(b.name);
  });
  const options: HintedOption[] = sorted.map((member) => ({ id: member.id, name: member.name, hint: loadLabel(member) }));
  if (current && !options.some((option) => option.id === current.id)) options.push({ id: current.id, name: current.name });
  return options;
}
