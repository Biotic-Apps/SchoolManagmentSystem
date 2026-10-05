import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useActiveBranches } from "@/features/branches/api";
import { useSchoolOptions } from "@/features/schools/api";
import { useSessionOptions } from "@/features/sessions/api";
import type { ScopeValue } from "@/lib/scope";

const EMPTY_SCOPE: ScopeValue = { schoolId: null, branchId: null, sessionId: null };

/** School › Branch › Session filter for the dashboard; empty levels mean "all in my scope". */
export function useDashboardScope() {
  const can = useCan();
  const [scope, setScope] = useState<ScopeValue>(EMPTY_SCOPE);
  const schools = useSchoolOptions(can("schools.view"));
  const { branches } = useActiveBranches(scope.schoolId ?? undefined, can("branches.view"));
  const sessions = useSessionOptions(can("sessions.view") ? scope.branchId : null);

  return {
    scope,
    setScope,
    reset: () => setScope(EMPTY_SCOPE),
    isFiltered: scope.schoolId !== null || scope.branchId !== null || scope.sessionId !== null,
    schools: schools.options,
    branches: branches.map((branch) => ({ id: branch.id, name: branch.name })),
    sessions: sessions.options,
    hideSchool: schools.options.length <= 1,
    showPicker: branches.length > 1 || schools.options.length > 1 || sessions.options.length > 0,
  };
}
