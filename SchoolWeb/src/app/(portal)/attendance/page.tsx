import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { AttendanceRoute } from "@/features/attendance/components/AttendanceRoute";

export const metadata: Metadata = { title: "Attendance & Leave" };

export default function Page() {
  return (
    <ModuleGuard moduleId="attendance">
      <AttendanceRoute />
    </ModuleGuard>
  );
}
