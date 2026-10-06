"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useInventoryRoute } from "../use-inventory-route";
import { AssetsTab } from "./AssetsTab";
import { ItemsTab } from "./ItemsTab";
import { MovementsTab } from "./MovementsTab";
import { PurchasingTab } from "./PurchasingTab";
import { SalesTab } from "./SalesTab";
import { StockTab } from "./StockTab";

export function InventoryRoute() {
  const route = useInventoryRoute();
  const { branchId } = route;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inventory & Purchasing"
        description="Stock levels, movements, tagged assets, purchase requests and student sales."
        actions={<BranchPickerSelect picker={route.picker} />}
      />
      {route.noBranch && (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Stock is kept per branch." />
        </Card>
      )}
      {branchId && (
        <Tabs value={route.tab} onValueChange={route.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            {route.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="stock">
            <StockTab branchId={branchId} />
          </TabsContent>
          <TabsContent value="items">
            <ItemsTab branchId={branchId} schoolId={route.schoolId} />
          </TabsContent>
          <TabsContent value="movements">
            <MovementsTab branchId={branchId} branchOptions={route.picker.options} />
          </TabsContent>
          <TabsContent value="assets">
            <AssetsTab branchId={branchId} />
          </TabsContent>
          <TabsContent value="purchasing">
            <PurchasingTab branchId={branchId} />
          </TabsContent>
          {route.tabs.some((tab) => tab.id === "sales") && (
            <TabsContent value="sales">
              <SalesTab branchId={branchId} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
