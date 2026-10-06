"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Input } from "@/components/ui/Input";
import { EXPENSE_STATUS_OPTIONS } from "../options";
import type { ExpensesTabState } from "../use-expenses-tab";

export function ExpenseFilters({ tab }: { tab: ExpensesTabState }) {
  const { list } = tab;
  return (
    <FilterBar onReset={list.reset}>
      <FilterSelect
        label="Category"
        allLabel="All categories"
        options={tab.lookups.categoryOptions}
        value={list.filters.categoryId}
        onChange={(value) => list.setFilter("categoryId", value)}
      />
      <FilterSelect
        label="Status"
        options={EXPENSE_STATUS_OPTIONS}
        value={list.filters.status}
        onChange={(value) => list.setFilter("status", value)}
      />
      <label className="flex items-center gap-2 text-label text-fg-muted">
        From
        <Input
          type="date"
          value={list.filters.from ?? ""}
          max={list.filters.to}
          onChange={(event) => list.setFilter("from", event.target.value || undefined)}
          className="md:w-40"
        />
      </label>
      <label className="flex items-center gap-2 text-label text-fg-muted">
        To
        <Input
          type="date"
          value={list.filters.to ?? ""}
          min={list.filters.from}
          onChange={(event) => list.setFilter("to", event.target.value || undefined)}
          className="md:w-40"
        />
      </label>
    </FilterBar>
  );
}
