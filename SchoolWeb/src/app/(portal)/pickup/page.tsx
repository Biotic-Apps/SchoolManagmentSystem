import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { PickupRoute } from "@/features/pickup/components/PickupRoute";

export const metadata: Metadata = { title: "Pickup & Departure" };

export default function Page() {
  return (
    <ModuleGuard moduleId="pickup">
      <PickupRoute />
    </ModuleGuard>
  );
}
