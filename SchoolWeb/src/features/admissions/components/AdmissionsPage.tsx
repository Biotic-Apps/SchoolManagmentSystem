"use client";

import { Building2, CalendarX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { useAdmissionsPage } from "../use-admissions-page";
import { ApplicationDetailDrawer } from "./ApplicationDetailDrawer";
import { ApplicationsTab } from "./ApplicationsTab";
import { EnquiriesTab } from "./EnquiriesTab";
import { WaitingListTab } from "./WaitingListTab";

export function AdmissionsPage() {
  const page = useAdmissionsPage();
  const { scope } = page;

  return (
    <>
      <PageHeader
        title="Admissions"
        description="Track enquiries, review applications, run entrance tests and enrol new students."
      />
      <div className="mb-4">
        <AcademicScopeBar scope={scope} withClass />
      </div>
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !!scope.error && (
        <Card>
          <ErrorState error={scope.error} />
        </Card>
      )}
      {!scope.isLoading && !scope.error && !page.ready && (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branch in your scope"
            description="Admissions are handled per branch. Ask your administrator to assign you a branch."
          />
        </Card>
      )}
      {!scope.isLoading && page.ready && !page.hasSession && (
        <Card>
          <EmptyState
            icon={CalendarX}
            title="No academic session"
            description="Create an academic session for this branch before taking admissions."
          />
        </Card>
      )}
      {page.ready && page.hasSession && (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="waiting-list">Waiting list</TabsTrigger>
          </TabsList>
          <TabsContent value="enquiries">
            <EnquiriesTab scope={scope} onConverted={page.showConverted} />
          </TabsContent>
          <TabsContent value="applications">
            <ApplicationsTab scope={scope} onOpen={page.openDetail} />
          </TabsContent>
          <TabsContent value="waiting-list">
            <WaitingListTab scope={scope} onOpen={page.openDetail} />
          </TabsContent>
        </Tabs>
      )}
      <ApplicationDetailDrawer
        applicationId={page.detailId}
        classOptions={scope.classes.options}
        onClose={page.closeDetail}
      />
    </>
  );
}
