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
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Add room" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar search={{ value: list.search, onChange: list.setSearch, placeholder: "Search rooms" }} />
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No rooms yet"
        emptyDescription="Add the classrooms of this branch so sections can be given a room."
        pagination={tab.pagination}
      />
      {tab.form.open && <RoomFormDialog item={tab.form.item} branchId={branchId} onClose={tab.form.close} />}
    </div>
  );
}
