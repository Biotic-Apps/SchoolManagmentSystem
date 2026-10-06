"use client";

import { useIsParent } from "@/features/auth/use-active-child";
import { ChildDiaryView } from "./ChildDiaryView";
import { DiaryStaffPage } from "./DiaryStaffPage";

export function DiaryRoute() {
  return useIsParent() ? <ChildDiaryView /> : <DiaryStaffPage />;
}
