import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { StaffPage } from "@/features/staff/components/StaffPage";

export const metadata: Metadata = { title: "Teachers & Helpers" };

export default function Page() {
  return (
    <ModuleGuard moduleId="staff">
      <StaffPage />
    </ModuleGuard>
  );
}
