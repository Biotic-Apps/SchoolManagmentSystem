import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSaveStatus } from "@/lib/use-save-status";
import { useBellScheduleQuery } from "@/features/timetable/bell-api";
import { classSaveKey, useClassSetup } from "../setup-api";
import { useTeachingStaff } from "../teaching-staff-api";
import { useAcademicScope } from "../use-academic-scope";

/** Class setup: branch/session from the link (else the defaults), the setup data and shared lookups. */
export function useClassSetupPage(classId: string) {
  const params = useSearchParams();
  const scope = useAcademicScope({ branchId: params.get("branchId"), sessionId: params.get("sessionId") });
  const { branchId, sessionId, schoolId } = scope;
  const query = useClassSetup(classId, branchId, sessionId);
  const staff = useTeachingStaff(branchId, sessionId);
  const bell = useBellScheduleQuery(branchId);
  const saveStatus = useSaveStatus(classSaveKey(classId));
  const loaded = !!query.data;

  // Links like "#teachers" point at a card that only exists once the data is in.
  useEffect(() => {
    if (!loaded) return;
    const hash = window.location.hash.slice(1);
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: "start" });
  }, [loaded]);

  return {
    scope,
    branchId,
    sessionId,
    schoolId,
    query,
    setup: query.data ?? null,
    staff: staff.data ?? [],
    staffLoading: staff.isLoading,
    bell: bell.data ?? null,
    saveStatus,
  };
}

export type ClassSetupPageState = ReturnType<typeof useClassSetupPage>;
