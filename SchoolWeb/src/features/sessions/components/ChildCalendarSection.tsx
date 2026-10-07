"use client";

import { DataTable } from "@/components/shared/DataTable";
import { cn } from "@/lib/cn";
import { useChildCalendar } from "../use-child-calendar";

/** PARENT: holidays and events for the next 90 days (GET /students/:id/calendar). */
export function ChildCalendarSection({ className }: { className?: string }) {
  const { child, query, events, columns } = useChildCalendar();
  if (!child) return null;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-label="Upcoming school calendar">
      <h2 className="text-card-title font-semibold text-fg">Upcoming school calendar</h2>
      <DataTable
        columns={columns}
        rows={events}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        skeletonRows={3}
        emptyTitle="Nothing on the calendar"
        emptyDescription="Holidays, vacations and school events for the next three months appear here."
      />
    </section>
  );
}
