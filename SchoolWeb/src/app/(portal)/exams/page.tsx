import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ExamsRoute } from "@/features/exams/components/ExamsRoute";

export const metadata: Metadata = { title: "Exams & Results" };

export default function Page() {
  return (
    <ModuleGuard moduleId="exams">
      <ExamsRoute />
    </ModuleGuard>
  );
}
