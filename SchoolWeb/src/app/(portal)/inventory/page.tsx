import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { InventoryRoute } from "@/features/inventory/components/InventoryRoute";

export const metadata: Metadata = { title: "Inventory & Purchasing" };

export default function Page() {
  return (
    <ModuleGuard moduleId="inventory">
      <InventoryRoute />
    </ModuleGuard>
  );
}
