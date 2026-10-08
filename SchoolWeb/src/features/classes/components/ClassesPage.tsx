"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useClassesPage } from "../use-classes-page";
import { AcademicScopeBar } from "./AcademicScopeBar";
import { CatalogueTab } from "./CatalogueTab";
import { ClassesOverviewTab } from "./ClassesOverviewTab";

export function ClassesPage() {
  const { scope, tab, setTab } = useClassesPage();
  const { branchId, schoolId, sessionId } = scope;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Classes"
        description="Each class with its sections, subjects and teachers. Open a class to set it up on one screen."
      />
      <AcademicScopeBar scope={scope} />
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !!scope.error && (
        <Card>
          <ErrorState error={scope.error} />
        </Card>
      )}
      {!scope.isLoading && !scope.error && (!branchId || !schoolId) && (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branch in your scope"
            description="Classes are set up per school branch. Ask your administrator to assign you a branch."
          />
        </Card>
      )}
      {branchId && schoolId && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="catalogue">Subjects & rooms</TabsTrigger>
          </TabsList>
          <TabsContent value="classes">
            <ClassesOverviewTab key={`${branchId}-${sessionId}`} branchId={branchId} schoolId={schoolId} sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="catalogue">
            <CatalogueTab key={branchId} branchId={branchId} schoolId={schoolId} sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
