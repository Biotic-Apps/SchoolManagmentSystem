"use client";

import { Building2, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { MonthCalendar } from "@/components/shared/MonthCalendar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { activityColumns } from "../activity-columns";
import { ACTIVITY_STATUS_OPTIONS, ACTIVITY_TYPE_OPTIONS } from "../options";
import { useActivitiesPage } from "../use-activities-page";
import { ActivityDetailDrawer } from "./ActivityDetailDrawer";
import { ActivityFormDialog } from "./ActivityFormDialog";

export function ActivitiesPage() {
  const page = useActivitiesPage();
  const { scope, query, composer } = page;
  const noBranch = !scope.isLoading && !scope.branchId;

  return (
    <>
      <PageHeader
        title="Activities & Events"
        description="Events, sports, trips, competitions and clubs: proposals, approval, consent and results."
        actions={
          page.canPropose && (
            <Button onClick={() => composer.show()}>
              <Plus />
              Propose activity
            </Button>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <BranchPickerSelect picker={scope.picker} />
        <FilterSelect label="Type" options={ACTIVITY_TYPE_OPTIONS} value={page.type} onChange={page.setType} />
        <FilterSelect label="Status" options={ACTIVITY_STATUS_OPTIONS} value={page.status} onChange={page.setStatus} />
        <Tabs value={page.view} onValueChange={page.setView} className="md:ml-auto">
          <TabsList className="h-11">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {noBranch && (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Activities are planned per branch." />
        </Card>
      )}
      {!noBranch && page.view === "list" && (
        <DataTable
          columns={activityColumns(page.audience.nameOf)}
          rows={page.rows}
          getRowId={(row) => row.id}
          loading={scope.isLoading || query.isLoading}
          error={query.error}
          onRetry={() => query.refetch()}
          onRowClick={(row) => page.openDetail(row.id)}
          emptyTitle="No activities"
          emptyDescription="Proposed and announced activities appear here."
        />
      )}
      {!noBranch && page.view === "calendar" && (
        <MonthCalendar
          month={page.month}
          onMonthChange={page.setMonth}
          items={page.calendarItems}
          onItemClick={page.openDetail}
        />
      )}
      {composer.open && scope.branchId && (
        <ActivityFormDialog
          activity={composer.item}
          branchId={scope.branchId}
          audience={page.audience}
          onClose={composer.close}
        />
      )}
      <ActivityDetailDrawer
        activityId={page.detailId}
        audience={page.audience}
        onClose={page.closeDetail}
        onEdit={(activity) => {
          page.closeDetail();
          composer.show(activity);
        }}
      />
    </>
  );
}
