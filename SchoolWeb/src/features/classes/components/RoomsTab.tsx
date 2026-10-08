"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { useRoomsTab } from "../use-rooms-tab";
import { RoomFormDialog } from "./RoomFormDialog";
import { TabToolbar } from "./TabToolbar";

export function RoomsTab({ branchId }: { branchId: string }) {
  const tab = useRoomsTab(branchId);
  const { list, query } = tab;

  return (
    <section className="flex min-w-0 flex-col gap-3" aria-labelledby="rooms-heading">
      <h2 id="rooms-heading" className="text-card-title font-semibold text-fg">
        Rooms
      </h2>
      <TabToolbar addLabel="Add room" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search rooms" }} />
      </TabToolbar>
      <DataTable
        stickyHeader
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No rooms yet"
        emptyDescription="Rooms can also be added right where you need them: in Class setup or the timetable."
        pagination={tab.pagination}
      />
      {tab.form.open && <RoomFormDialog item={tab.form.item} branchId={branchId} onClose={tab.form.close} />}
    </section>
  );
}
