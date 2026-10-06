"use client";

import { Building2 } from "lucide-react";
import { DateStepper } from "@/components/shared/DateStepper";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { usePickupRoute } from "../use-pickup-route";
import { AuthorizedPersonsTab } from "./AuthorizedPersonsTab";
import { DeparturesTab } from "./DeparturesTab";
import { EarlyLeaveTab } from "./EarlyLeaveTab";

export function PickupRoute() {
  const route = usePickupRoute();
  const { picker, branchId, date } = route;

  return (
    <>
      <PageHeader
        title="Pickup & Departure"
        description="Early-leave requests, the gate departure log and who may collect each student."
      />
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={picker} className="md:w-56" />
        {route.showDate && <DateStepper value={date} onChange={route.setDate} />}
      </div>
      {picker.isLoading && <Skeleton className="h-64 w-full rounded-card" />}
      {!!picker.error && (
        <Card>
          <ErrorState error={picker.error} />
        </Card>
      )}
      {!picker.isLoading && !picker.error && !branchId && (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branch in your scope"
            description="Pickup and departures are kept per branch. Ask your administrator to assign you a branch."
          />
        </Card>
      )}
      {branchId && (
        <Tabs value={route.tab} onValueChange={route.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="early-leave">Early leave</TabsTrigger>
            <TabsTrigger value="departures">Departures</TabsTrigger>
            <TabsTrigger value="persons">Authorized persons</TabsTrigger>
          </TabsList>
          <TabsContent value="early-leave">
            <EarlyLeaveTab branchId={branchId} date={date} />
          </TabsContent>
          <TabsContent value="departures">
            <DeparturesTab branchId={branchId} date={date} />
          </TabsContent>
          <TabsContent value="persons">
            <AuthorizedPersonsTab branchId={branchId} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
