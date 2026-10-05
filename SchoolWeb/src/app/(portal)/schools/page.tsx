import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { SchoolsPage } from "@/features/schools/components/SchoolsPage";

export const metadata: Metadata = { title: "Schools" };

export default function Page() {
  return (
    <ModuleGuard moduleId="schools">
      <SchoolsPage />
    </ModuleGuard>
  );
}
