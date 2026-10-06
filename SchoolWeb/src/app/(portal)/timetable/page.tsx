import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { TimetablePage } from "@/features/timetable/components/TimetablePage";

export const metadata: Metadata = { title: "Timetable" };

export default function Page() {
  return (
    <ModuleGuard moduleId="timetable">
      <TimetablePage />
    </ModuleGuard>
  );
}
