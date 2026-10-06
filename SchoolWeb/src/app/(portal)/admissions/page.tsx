import type { Metadata } from "next";
import { AdmissionsPage } from "@/features/admissions/components/AdmissionsPage";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Admissions" };

export default function Page() {
  return (
    <ModuleGuard moduleId="admissions">
      <AdmissionsPage />
    </ModuleGuard>
  );
}
