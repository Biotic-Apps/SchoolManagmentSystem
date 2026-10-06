"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { COMPLAINT_CATEGORY_OPTIONS, COMPLAINT_STATUS_OPTIONS } from "../options";
import type { ComplaintBox } from "../types";
import { useComplaintsTab } from "../use-complaints-tab";

const EMPTY_TEXT: Record<ComplaintBox, string> = {
  mine: "Complaints you file appear here with their progress.",
  assigned: "Complaints routed to you appear here.",
  all: "Complaints in your scope appear here.",
};

interface ComplaintsTabProps {
  box: ComplaintBox;
  onOpen: (id: string) => void;
}

export function ComplaintsTab({ box, onOpen }: ComplaintsTabProps) {
  const tab = useComplaintsTab(box);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search ticket or subject" }}
        onReset={list.reset}
      >
        <FilterSelect
          label="Status"
          options={COMPLAINT_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
        <FilterSelect
          label="Category"
          allLabel="All categories"
          options={COMPLAINT_CATEGORY_OPTIONS}
          value={list.filters.category}
          onChange={(value) => list.setFilter("category", value)}
        />
      </FilterBar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={(row) => onOpen(row.id)}
        emptyTitle="No complaints"
        emptyDescription={EMPTY_TEXT[box]}
        pagination={tab.pagination}
      />
    </div>
  );
}
