import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { TemplateBuilderRoute } from "@/features/exams/report-card-templates/components/TemplateBuilderRoute";

export const metadata: Metadata = { title: "Report Card Templates" };

export default function Page() {
  return (
    <ModuleGuard moduleId="exams">
      <TemplateBuilderRoute />
    </ModuleGuard>
  );
}
