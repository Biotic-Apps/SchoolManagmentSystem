"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useExpensesRoute } from "../use-expenses-route";
import { CategoriesTab } from "./CategoriesTab";
import { ExpensesTab } from "./ExpensesTab";
import { VendorsTab } from "./VendorsTab";

export function ExpensesRoute() {
  const route = useExpensesRoute();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses & Vendors"
        description="Record bills, send them for approval and track what has been paid."
        actions={<BranchPickerSelect picker={route.picker} />}
      />
      {route.noBranch ? (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Expenses are recorded per branch." />
        </Card>
      ) : (
        <Tabs value={route.tab} onValueChange={route.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="expenses">
            {route.branchId && <ExpensesTab branchId={route.branchId} schoolId={route.schoolId} canAdd={route.canAdd} />}
          </TabsContent>
          <TabsContent value="vendors">
            <VendorsTab schoolId={route.schoolId} />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab schoolId={route.schoolId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
