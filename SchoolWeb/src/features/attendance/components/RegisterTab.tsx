"use client";

import { LayoutGrid } from "lucide-react";
import { DateStepper } from "@/components/shared/DateStepper";
import { EmptyState } from "@/components/shared/EmptyState";
import { UnsavedChangesGuard, useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionScopeBar } from "@/features/classes/components/SectionScopeBar";
import { todayIso } from "@/lib/dates";
import type { AttendancePageState } from "../use-attendance-page";
import { RegisterPanel } from "./RegisterPanel";

export function RegisterTab({ page }: { page: AttendancePageState }) {
  return (
    <UnsavedChangesGuard>
      <RegisterTabContent page={page} />
    </UnsavedChangesGuard>
  );
}

function RegisterTabContent({ page }: { page: AttendancePageState }) {
  const scope = page.sectionScope;
  const guard = useGuardedAction();
  return (
    <div className="flex flex-col gap-4">
      <SectionScopeBar scope={scope}>
        <DateStepper value={page.date} onChange={(date) => guard(() => page.setDate(date))} max={todayIso()} />
      </SectionScopeBar>
      {scope.isLoading && <Skeleton className="h-64 w-full" />}
      {!scope.isLoading && !!scope.error && (
        <Card>
          <ErrorState error={scope.error} />
        </Card>
      )}
      {!scope.isLoading && !scope.error && !scope.sectionId && (
        <Card>
          <EmptyState
            icon={LayoutGrid}
            title="No section to mark"
            description="Registers appear for the sections you are assigned to in the active session."
          />
        </Card>
      )}
      {scope.sectionId && (
        <RegisterPanel key={`${scope.sectionId}:${page.date}`} sectionId={scope.sectionId} date={page.date} />
      )}
    </div>
  );
}
