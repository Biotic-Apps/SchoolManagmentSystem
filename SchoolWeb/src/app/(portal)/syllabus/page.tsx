import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { SyllabusRoute } from "@/features/syllabus/components/SyllabusRoute";

export const metadata: Metadata = { title: "Syllabus & Books" };

export default function Page() {
  return (
    <ModuleGuard moduleId="syllabus">
      <SyllabusRoute />
    </ModuleGuard>
  );
}
