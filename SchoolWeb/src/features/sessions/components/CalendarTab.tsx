"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { MonthCalendar } from "@/components/shared/MonthCalendar";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { monthLabel } from "@/lib/dates";
import { useCalendarTab } from "../use-calendar-tab";
import { EventDeleteDialog } from "./EventDeleteDialog";
import { EventFormDialog } from "./EventFormDialog";

interface CalendarTabProps {
  schoolId: string | null;
  branchId: string | null;
}

export function CalendarTab({ schoolId, branchId }: CalendarTabProps) {
  const tab = useCalendarTab(branchId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="School calendar"
        actions={
          tab.canAdd && (
            <Button size="sm" onClick={() => tab.form.show()}>
              <Plus />
              Add entry
            </Button>
          )
        }
      />
      {query.error ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <MonthCalendar month={tab.month} onMonthChange={tab.setMonth} items={tab.items} onItemClick={tab.onItemClick} />
      )}
      <div className="flex flex-col gap-3">
        <SectionHeading title={`Entries in ${monthLabel(tab.month)}`} />
        <DataTable
          columns={tab.columns}
          rows={tab.events}
          getRowId={(row) => row.id}
          loading={query.isLoading}
          error={query.error}
          onRetry={() => query.refetch()}
          skeletonRows={3}
          emptyTitle="Nothing on the calendar this month"
          emptyDescription="Holidays, vacations, deadlines and events you add appear here and on the calendar."
        />
      </div>
      {tab.form.open && (
        <EventFormDialog event={tab.form.item} schoolId={schoolId} branchId={branchId} onClose={tab.form.close} />
      )}
      <EventDeleteDialog event={tab.deleteTarget.item} onClose={tab.deleteTarget.close} />
    </div>
  );
}
