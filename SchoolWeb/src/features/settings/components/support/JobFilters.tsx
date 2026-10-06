"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { JOB_STATUS_OPTIONS, QUEUE_OPTIONS } from "../../support-options";
import type { SupportJobsState } from "../../use-support-jobs";
import { DateFilter } from "./DateFilter";

export function JobFilters({ list }: { list: SupportJobsState["list"] }) {
  const { filters, setFilter } = list;
  return (
    <FilterBar onReset={list.reset}>
      <FilterSelect
        label="Queue"
        options={QUEUE_OPTIONS}
        value={filters.queue}
        onChange={(value) => setFilter("queue", value)}
      />
      <FilterSelect
        label="Status"
        options={JOB_STATUS_OPTIONS}
        value={filters.status}
        onChange={(value) => setFilter("status", value)}
      />
      <DateFilter label="From" value={filters.from} onChange={(value) => setFilter("from", value)} />
    </FilterBar>
  );
}
