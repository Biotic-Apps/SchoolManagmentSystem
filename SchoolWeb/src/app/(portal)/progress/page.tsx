import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ProgressRoute } from "@/features/progress/components/ProgressRoute";

export const metadata: Metadata = { title: "Student Progress" };

export default function Page() {
  return (
    <ModuleGuard moduleId="progress">
      <ProgressRoute />
    </ModuleGuard>
  );
}
