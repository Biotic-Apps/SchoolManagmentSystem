"use client";

import { CalendarClock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateRange } from "@/lib/format";
import { formatTimeRange } from "@/lib/time";
import { weekdayLabel } from "../options";
import { useMySlots } from "../use-my-slots";
import { SlotItem } from "./SlotItem";
import { SlotsDialog } from "./SlotsDialog";

export function MySlotsTab() {
  const slots = useMySlots();
  const { query, deleteDialog } = slots;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="size-11" aria-label="Previous week" onClick={slots.previousWeek}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" size="icon" className="size-11" aria-label="Next week" onClick={slots.nextWeek}>
            <ChevronRight />
          </Button>
          <span className="whitespace-nowrap px-2 text-label font-medium text-fg">{formatDateRange(slots.from, slots.to)}</span>
          {!slots.isThisWeek && (
            <Button variant="ghost" onClick={slots.thisWeek}>
              This week
            </Button>
          )}
        </div>
        <Button onClick={() => slots.addDialog.show(true)} className="self-start md:self-auto">
          <Plus />
          Add slots
        </Button>
      </div>

      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {!query.isLoading && !query.error && slots.days.length === 0 && (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title="No slots this week"
            description="Add times when parents can book a meeting with you."
          />
        </Card>
      )}
      {slots.days.map((day) => (
        <Card key={day.date}>
          <CardContent className="flex flex-col gap-3">
            <h3 className="text-body font-semibold text-fg">{weekdayLabel(day.date)}</h3>
            <ul className="flex flex-col gap-2">
              {day.items.map((slot) => (
                <SlotItem key={slot.id} slot={slot} onDelete={() => deleteDialog.show(slot)} />
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {slots.addDialog.open && <SlotsDialog startDate={slots.from} onClose={slots.addDialog.close} />}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title="Remove this slot?"
        description={
          deleteDialog.item
            ? `${weekdayLabel(deleteDialog.item.date)}, ${formatTimeRange(deleteDialog.item.startTime, deleteDialog.item.endTime)}`
            : undefined
        }
        confirmLabel="Remove"
        tone="danger"
        loading={slots.deleting}
        onConfirm={slots.confirmDelete}
      />
    </div>
  );
}
