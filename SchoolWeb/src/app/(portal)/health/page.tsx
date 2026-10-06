import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { HealthRoute } from "@/features/health/components/HealthRoute";

export const metadata: Metadata = { title: "Health & Safety" };

export default function Page() {
  return (
    <ModuleGuard moduleId="health">
      <HealthRoute />
    </ModuleGuard>
  );
}
