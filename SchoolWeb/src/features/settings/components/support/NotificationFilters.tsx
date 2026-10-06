"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { CHANNEL_OPTIONS } from "../../support-options";
import type { SupportNotificationsState } from "../../use-support-notifications";
import { DateFilter } from "./DateFilter";

export function NotificationFilters({ list }: { list: SupportNotificationsState["list"] }) {
  const { filters, setFilter } = list;
  return (
    <FilterBar onReset={list.reset}>
      <FilterSelect
        label="Channel"
        options={CHANNEL_OPTIONS}
        value={filters.channel}
        onChange={(value) => setFilter("channel", value)}
      />
      <DateFilter label="From" value={filters.from} max={filters.to} onChange={(value) => setFilter("from", value)} />
      <DateFilter label="To" value={filters.to} min={filters.from} onChange={(value) => setFilter("to", value)} />
    </FilterBar>
  );
}
