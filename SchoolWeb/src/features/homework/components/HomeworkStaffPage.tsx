"use client";

import { useState } from "react";
import { BookCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionScopeBar } from "@/features/classes/components/SectionScopeBar";
import { useSectionScope } from "@/features/classes/use-section-scope";
import { useHomeworkList } from "../api";
import { HomeworkCard } from "./HomeworkCard";
import { AssignHomeworkDialog } from "./AssignHomeworkDialog";
import { SubmissionsPanel } from "./SubmissionsPanel";
import type { Homework } from "../types";

export function HomeworkStaffPage() {
  const scope = useSectionScope();
  const [showAssign, setShowAssign] = useState(false);
  const [selectedHw, setSelectedHw] = useState<Homework | null>(null);

  const query = useHomeworkList(
    { sectionId: scope.sectionId ?? undefined },
    !!scope.sectionId,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Homework Submissions"
        description="Assign homework, view submissions and grade them."
        actions={
          scope.sectionId ? (
            <Button variant="primary" onClick={() => setShowAssign(true)}>
              <Plus />
              Assign homework
            </Button>
          ) : undefined
        }
      />
      <SectionScopeBar scope={scope} />

      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !scope.sectionId && (
        <Card>
          <EmptyState title="Select a section" description="Pick a class section above to manage homework." />
        </Card>
      )}

      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {query.data && query.data.length === 0 && (
        <Card>
          <EmptyState
            icon={BookCheck}
            title="No homework yet"
            description="Assign homework to this section using the button above."
          />
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {query.data?.map((hw) => (
          <HomeworkCard key={hw.id} homework={hw} onSelect={() => setSelectedHw(hw)} />
        ))}
      </div>

      {showAssign && scope.sectionId && (
        <AssignHomeworkDialog
          open={showAssign}
          onOpenChange={setShowAssign}
          sectionId={scope.sectionId}
        />
      )}

      {selectedHw && (
        <SubmissionsPanel
          homework={selectedHw}
          open={!!selectedHw}
          onClose={() => setSelectedHw(null)}
        />
      )}
    </div>
  );
}
