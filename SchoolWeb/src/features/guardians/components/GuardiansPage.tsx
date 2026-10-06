"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useGuardiansPage } from "../use-guardians-page";
import { GuardianDetailDrawer } from "./GuardianDetailDrawer";
import { GuardiansTab } from "./GuardiansTab";
import { LinkRequestsTab } from "./LinkRequestsTab";

export function GuardiansPage() {
  const page = useGuardiansPage();
  const { picker, branchId } = page;

  return (
    <>
      <PageHeader
        title="Parents & Guardians"
        description="Guardian records, parent app accounts and child link requests."
        actions={<BranchPickerSelect picker={picker} />}
      />
      {picker.isLoading && <Skeleton className="h-64 w-full" />}
      {!picker.isLoading && !!picker.error && (
        <Card>
          <ErrorState error={picker.error} />
        </Card>
      )}
      {!picker.isLoading && !picker.error && !branchId && (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Ask your administrator to assign you a branch." />
        </Card>
      )}
      {branchId && (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList>
            <TabsTrigger value="guardians">Guardians</TabsTrigger>
            <TabsTrigger value="requests">Link requests</TabsTrigger>
          </TabsList>
          <TabsContent value="guardians">
            <GuardiansTab key={branchId} branchId={branchId} onOpen={page.openGuardian} />
          </TabsContent>
          <TabsContent value="requests">
            <LinkRequestsTab key={branchId} branchId={branchId} />
          </TabsContent>
        </Tabs>
      )}
      <GuardianDetailDrawer guardianId={page.openId} branchId={branchId} onClose={page.closeDrawer} />
    </>
  );
}
