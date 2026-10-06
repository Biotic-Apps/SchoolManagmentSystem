import { useMemo, useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { useSession } from "@/features/auth/session-context";
import { useSchoolOptions } from "@/features/schools/api";

/** Settings are per school: super admins pick one, everyone else uses their own school. */
export function useSettingsSchool() {
  const { session } = useSession();
  const isSuperAdmin = session?.activeRole === "SUPER_ADMIN";
  const schools = useSchoolOptions(isSuperAdmin);
  const [chosenId, setSchoolId] = useState<string | null>(null);

  const ownSchools: Option[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const assignment of session?.assignments ?? []) {
      if (assignment.role === session?.activeRole && assignment.schoolId) {
        seen.set(assignment.schoolId, assignment.schoolName ?? "School");
      }
    }
    return [...seen].map(([id, name]) => ({ id, name }));
  }, [session]);

  const options = isSuperAdmin ? schools.options : ownSchools;
  const schoolId = options.find((option) => option.id === chosenId)?.id ?? options[0]?.id ?? null;

  return {
    schoolId,
    setSchoolId,
    options,
    isLoading: isSuperAdmin && schools.isLoading,
    showPicker: options.length > 1,
  };
}

export type SettingsSchool = ReturnType<typeof useSettingsSchool>;
