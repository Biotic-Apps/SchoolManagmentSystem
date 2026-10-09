import type { Option } from "@/components/shared/OptionSelect";
import type { MeetingTeacher } from "./types";

const MAX_ROLES = 2;

function rolesLabel(roles: string[]): string {
  const shown = roles.slice(0, MAX_ROLES).join(", ");
  return roles.length > MAX_ROLES ? `${shown} +${roles.length - MAX_ROLES}` : shown;
}

export function openTimesLabel(count: number): string {
  if (count === 0) return "no open times yet";
  return count === 1 ? "1 open time" : `${count} open times`;
}

/** "Aqsa (Class teacher, English +6) · no open times yet" */
export function teacherOptions(teachers: MeetingTeacher[]): Option[] {
  return teachers.map((teacher) => ({
    id: teacher.userId,
    name: `${teacher.name}${teacher.roles.length ? ` (${rolesLabel(teacher.roles)})` : ""} · ${openTimesLabel(teacher.openSlots)}`,
  }));
}
