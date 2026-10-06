"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { UnsavedChangesGuard } from "@/components/shared/UnsavedChangesGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { SectionScopeBar } from "@/features/classes/components/SectionScopeBar";
import { useProgressPage } from "../use-progress-page";
import { FeedbackTab } from "./FeedbackTab";
import { HomeworkTab } from "./HomeworkTab";
import { NoSectionState } from "./NoSectionState";

export function ProgressStaffPage() {
  return (
    <UnsavedChangesGuard>
      <ProgressStaffContent />
    </UnsavedChangesGuard>
  );
}

function ProgressStaffContent() {
  const page = useProgressPage();
  const { scope } = page;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student Progress"
        description="Teacher feedback for each student and who completed the homework set in the diary."
      />
      <SectionScopeBar scope={scope} />
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !scope.sectionId && <NoSectionState error={scope.error} />}
      {scope.sectionId && (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="feedback">Feedback notes</TabsTrigger>
            <TabsTrigger value="homework">Homework completion</TabsTrigger>
          </TabsList>
          <TabsContent value="feedback">
            <FeedbackTab key={scope.sectionId} sectionId={scope.sectionId} />
          </TabsContent>
          <TabsContent value="homework">
            <HomeworkTab key={scope.sectionId} sectionId={scope.sectionId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
