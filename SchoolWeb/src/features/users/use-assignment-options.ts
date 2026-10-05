import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useActiveBranches } from "@/features/branches/api";
import { useSchoolOptions } from "@/features/schools/api";
import { http } from "@/lib/http";
import { assignableRoleOptions } from "./assignment-rules";

interface RoleRow {
  key: string;
  name: string;
  isSystem: boolean;
}

function useCustomRoles(enabled: boolean) {
  return useQuery({
    queryKey: ["users", "assignable-roles"],
    queryFn: async () => (await http.get<RoleRow[]>("/roles")).data.filter((role) => !role.isSystem),
    enabled,
  });
}

/** Roles, schools and branches the active role may hand out in an assignment. */
export function useAssignmentOptions() {
  const can = useCan();
  const activeRole = useSession().session?.activeRole ?? "";
  const customRoles = useCustomRoles(can("roles.view"));
  const { branches } = useActiveBranches();
  const allSchools = useSchoolOptions(can("schools.view"));

  return useMemo(() => {
    const custom: Option[] = (customRoles.data ?? []).map((role) => ({ id: role.key, name: role.name }));
    const branchSchools = new Map(branches.map((branch) => [branch.schoolId, branch.schoolName]));
    const multiSchool = branchSchools.size > 1;
    const schoolOptions = allSchools.options.length
      ? allSchools.options
      : [...branchSchools].map(([id, name]) => ({ id, name }));
    return {
      activeRole,
      roleOptions: assignableRoleOptions(activeRole, custom),
      schoolOptions,
      branchOptions: branches.map((branch) => ({
        id: branch.id,
        name: multiSchool ? `${branch.schoolName} › ${branch.name}` : branch.name,
      })),
    };
  }, [activeRole, customRoles.data, branches, allSchools.options]);
}

export type AssignmentOptions = ReturnType<typeof useAssignmentOptions>;
