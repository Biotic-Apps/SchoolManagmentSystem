"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { useSyllabusPage } from "../use-syllabus-page";
import { BookListsTab } from "./BookListsTab";
import { CoverageTab } from "./CoverageTab";
import { PlansTab } from "./PlansTab";

export function SyllabusPage() {
  const { scope, tab, setTab, tabScope, scopeKey } = useSyllabusPage();

  return (
    <>
      <PageHeader
        title="Syllabus & Books"
        description="Book lists per class, syllabus plans per section and subject, and how far each section has got."
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
      {!scope.isLoading && !scope.error && !tabScope && (
        <Card>
          <EmptyState
            icon={Building2}
            title="No branch in your scope"
            description="Syllabus and book lists are kept per branch. Ask your administrator to assign you a branch."
          />
        </Card>
      )}
      {!scope.isLoading && tabScope && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="books">Book lists</TabsTrigger>
            <TabsTrigger value="plans">Syllabus plans</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
          </TabsList>
          <TabsContent value="books">
            <BookListsTab key={scopeKey} {...tabScope} />
          </TabsContent>
          <TabsContent value="plans">
            <PlansTab key={scopeKey} {...tabScope} />
          </TabsContent>
          <TabsContent value="coverage">
            <CoverageTab key={scopeKey} {...tabScope} schoolId={scope.schoolId} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
