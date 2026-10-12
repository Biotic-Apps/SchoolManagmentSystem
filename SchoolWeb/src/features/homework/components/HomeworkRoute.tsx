"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { HomeworkStaffPage } from "./HomeworkStaffPage";
import { HomeworkParentPage } from "./HomeworkParentPage";

export function HomeworkRoute() {
  return useIsParent() ? <HomeworkParentPage /> : <HomeworkStaffPage />;
}
