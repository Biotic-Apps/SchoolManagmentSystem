"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { ChildResultsView } from "@/features/exams/components/parent/ChildResultsView";
import { useParentProgress } from "../use-parent-progress";
import { ChildFeedbackTab } from "./ChildFeedbackTab";
import { ChildHomeworkTab } from "./ChildHomeworkTab";

/** PARENT: results, teacher feedback and homework of the child picked in the Topbar. */
export function ParentProgressPage() {
  const page = useParentProgress();
  const { child } = page;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Progress & Results" description={page.caption} />
      {!child ? (
        <NoChildState description="Once your child link is verified, their results and teacher feedback appear here." />
      ) : (
        <Tabs value={page.tab} onValueChange={page.setTab}>
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="feedback">Teacher feedback</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
          </TabsList>
          <TabsContent value="results">
            <ChildResultsView withHeader={false} />
          </TabsContent>
          <TabsContent value="feedback">
            <ChildFeedbackTab childId={child.id} />
          </TabsContent>
          <TabsContent value="homework">
            <ChildHomeworkTab childId={child.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
