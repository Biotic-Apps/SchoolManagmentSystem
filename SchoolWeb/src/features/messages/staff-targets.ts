import type { Option } from "@/components/shared/OptionSelect";
import type { PersonRef } from "@/features/people/types";
import type { SectionStaff } from "@/features/staff/types";

type StaffRef = PersonRef & { userId?: string | null };

/**
 * Section staff a parent can address, keyed by user id. The section-staff DTO may not carry
 * user ids; staff without one are left out (the API then routes to the class teacher / office).
 */
export function staffTargetOptions(staff: SectionStaff | undefined): Option[] {
  if (!staff) return [];
  const entries: { ref: StaffRef; role: string }[] = [
    ...(staff.classTeacher ? [{ ref: staff.classTeacher as StaffRef, role: "Class teacher" }] : []),
    ...staff.subjectTeachers.map((entry) => ({ ref: entry.staff as StaffRef, role: entry.subject.name })),
  ];
  const byUser = new Map<string, { name: string; roles: string[] }>();
  for (const { ref, role } of entries) {
    if (!ref.userId) continue;
    const current = byUser.get(ref.userId);
    if (current) current.roles.push(role);
    else byUser.set(ref.userId, { name: ref.name, roles: [role] });
  }
  return [...byUser].map(([id, { name, roles }]) => ({ id, name: `${name} (${roles.join(", ")})` }));
}
