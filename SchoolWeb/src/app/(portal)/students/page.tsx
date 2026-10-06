import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { StudentsRoute } from "@/features/students/components/StudentsRoute";

export const metadata: Metadata = { title: "Students" };

export default function Page() {
  return (
    <ModuleGuard moduleId="students">
      <StudentsRoute />
    </ModuleGuard>
  );
}
