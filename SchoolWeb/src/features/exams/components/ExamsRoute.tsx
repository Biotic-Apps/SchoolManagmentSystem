"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { ChildResultsView } from "./parent/ChildResultsView";
import { ExamsStaffPage } from "./ExamsStaffPage";

export function ExamsRoute() {
  return useIsParent() ? <ChildResultsView /> : <ExamsStaffPage />;
}
