"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { ParentProgressPage } from "./ParentProgressPage";
import { ProgressStaffPage } from "./ProgressStaffPage";

export function ProgressRoute() {
  return useIsParent() ? <ParentProgressPage /> : <ProgressStaffPage />;
}
