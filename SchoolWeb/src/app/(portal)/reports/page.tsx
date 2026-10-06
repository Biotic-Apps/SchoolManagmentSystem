import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ReportsPage } from "@/features/reports/components/ReportsPage";

export const metadata: Metadata = { title: "Reports & History" };

export default function Page() {
  return (
    <ModuleGuard moduleId="reports">
      <ReportsPage />
    </ModuleGuard>
  );
}
