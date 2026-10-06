"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { ParentFeesView } from "@/features/fees/components/parent/ParentFeesView";
import { FeesStaffPage } from "./FeesStaffPage";

export function FeesRoute() {
  return useIsParent() ? <ParentFeesView /> : <FeesStaffPage />;
}
