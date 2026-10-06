import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { ComplaintsRoute } from "@/features/complaints/components/ComplaintsRoute";

export const metadata: Metadata = { title: "Complaints" };

export default function Page() {
  return (
    <ModuleGuard moduleId="complaints">
      <ComplaintsRoute />
    </ModuleGuard>
  );
}
