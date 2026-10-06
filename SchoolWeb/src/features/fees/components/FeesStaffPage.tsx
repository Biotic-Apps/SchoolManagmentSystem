"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { CollectionsTab } from "@/features/fees/components/collections/CollectionsTab";
import { ConcessionsTab } from "@/features/fees/components/concessions/ConcessionsTab";
import { DuesTab } from "@/features/fees/components/dues/DuesTab";
import { PaymentsTab } from "@/features/fees/components/payments/PaymentsTab";
import { ProofsTab } from "@/features/fees/components/proofs/ProofsTab";
import { useFeesPage, type FeesTabId } from "../use-fees-page";
import { InvoicesTab } from "./invoices/InvoicesTab";
import { FinanceOverviewTab } from "./overview/FinanceOverviewTab";
import { FeeStructureTab } from "./structure/FeeStructureTab";

export function FeesStaffPage() {
  const page = useFeesPage();
  const { branchId, schoolId } = page;

  const content: Record<FeesTabId, ReactNode> = {
    overview: <FinanceOverviewTab branchId={branchId} />,
    invoices: <InvoicesTab branchId={branchId} schoolId={schoolId} />,
    payments: <PaymentsTab branchId={branchId} />,
    proofs: <ProofsTab branchId={branchId} />,
    dues: <DuesTab branchId={branchId} />,
    collections: <CollectionsTab branchId={branchId} />,
    concessions: <ConcessionsTab branchId={branchId} />,
    structure: <FeeStructureTab branchId={branchId} schoolId={schoolId} />,
  };

  return (
    <>
      <PageHeader
        title="Fees & Dues"
        description="Fee structure, invoices, payments and dues for the branch."
        actions={<BranchPickerSelect picker={page.picker} />}
      />
      {page.tabs.length === 0 ? (
        <EmptyState title="No access to fees" description="Ask an administrator for fee access." />
      ) : (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            {page.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {page.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {content[tab.id]}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}
