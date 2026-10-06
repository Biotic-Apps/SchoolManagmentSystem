import { useState } from "react";
import { useAcademicScope } from "@/features/classes/use-academic-scope";

export type AdmissionsTabId = "enquiries" | "applications" | "waiting-list";

/** Branch/session/class scope, the active tab and the application open in the detail drawer. */
export function useAdmissionsPage() {
  const scope = useAcademicScope();
  const [tab, setTab] = useState<AdmissionsTabId>("enquiries");
  const [detailId, setDetailId] = useState<string | null>(null);

  const showConverted = (applicationId: string) => {
    setTab("applications");
    setDetailId(applicationId);
  };

  return {
    scope,
    tab,
    setTab: (value: string) => setTab(value as AdmissionsTabId),
    detailId,
    openDetail: setDetailId,
    closeDetail: () => setDetailId(null),
    showConverted,
    ready: !!scope.branchId && !!scope.schoolId,
    hasSession: !!scope.sessionId,
  };
}

export type AdmissionsPageState = ReturnType<typeof useAdmissionsPage>;
