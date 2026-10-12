"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useAccountsRoute } from "../use-accounts-route";
import { IncomeTab } from "./IncomeTab";
import { IncomeCategoriesTab } from "./IncomeCategoriesTab";
import { ProfitLossTab } from "./ProfitLossTab";

export function AccountsRoute() {
  const route = useAccountsRoute();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        description="Track other income, manage categories and view profit & loss."
        actions={<BranchPickerSelect picker={route.picker} />}
      />
      {route.noBranch ? (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Accounts are tracked per branch." />
        </Card>
      ) : (
        <Tabs value={route.tab} onValueChange={route.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="income">Other Income</TabsTrigger>
            <TabsTrigger value="categories">Income Categories</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            {route.branchId && <IncomeTab branchId={route.branchId} schoolId={route.schoolId} canAdd={route.canAdd} />}
          </TabsContent>
          <TabsContent value="categories">
            <IncomeCategoriesTab schoolId={route.schoolId} />
          </TabsContent>
          <TabsContent value="profit-loss">
            {route.branchId && <ProfitLossTab branchId={route.branchId} />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
