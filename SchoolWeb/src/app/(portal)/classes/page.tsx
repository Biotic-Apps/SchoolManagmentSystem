import type { Metadata } from "next";
import { ClassesPage } from "@/features/classes/components/ClassesPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Classes, Sections & Subjects" };

export default function Page() {
  return (
    <ModuleGuard moduleId="classes">
      <ClassesPage />
    </ModuleGuard>
  );
}
