import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { DiaryRoute } from "@/features/diary/components/DiaryRoute";

export const metadata: Metadata = { title: "Daily Diary & Homework" };

export default function Page() {
  return (
    <ModuleGuard moduleId="diary">
      <DiaryRoute />
    </ModuleGuard>
  );
}
