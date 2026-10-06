import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { MyAttendancePage } from "@/features/my-attendance/components/MyAttendancePage";

export const metadata: Metadata = { title: "My Attendance, Leave & Salary" };

export default function Page() {
  return (
    <ModuleGuard moduleId="my_salary">
      <MyAttendancePage />
    </ModuleGuard>
  );
}
