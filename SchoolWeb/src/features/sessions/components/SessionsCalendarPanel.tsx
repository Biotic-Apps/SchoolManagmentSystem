"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { CalendarTab } from "./CalendarTab";
import { SessionsTab } from "./SessionsTab";

/** Branch picker + Sessions/Calendar tabs; embeddable without a page header. */
export function SessionsCalendarPanel() {
  const picker = useBranchPicker();

  if (picker.isLoading) return <Skeleton className="h-64 w-full" />;
  if (picker.error) {
    return (
      <Card>
        <ErrorState error={picker.error} />
      </Card>
    );
  }
  if (!picker.branchId) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="No branch available"
          description="Sessions and the calendar are set per branch. Add or activate a branch first."
        />
      </Card>
    );
  }

  return (
    <Tabs defaultValue="sessions" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <BranchPickerSelect picker={picker} />
      </div>
      <TabsContent value="sessions" className="mt-0">
        <SessionsTab branchId={picker.branchId} />
      </TabsContent>
      <TabsContent value="calendar" className="mt-0">
        <CalendarTab schoolId={picker.schoolId} branchId={picker.branchId} />
      </TabsContent>
    </Tabs>
  );
}
