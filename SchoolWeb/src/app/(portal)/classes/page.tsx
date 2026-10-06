import type { Metadata } from "next";
import { ClassesRoute } from "@/features/classes/components/ClassesRoute";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Classes, Sections & Subjects" };

export default function Page() {
  return (
    <ModuleGuard moduleId="classes">
      <ClassesRoute />
    </ModuleGuard>
  );
}
