import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { FeesRoute } from "@/features/fees/components/FeesRoute";

export const metadata: Metadata = { title: "Fees & Dues" };

export default function Page() {
  return (
    <ModuleGuard moduleId="fees">
      <FeesRoute />
    </ModuleGuard>
  );
}
