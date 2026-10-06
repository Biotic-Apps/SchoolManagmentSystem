"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PeriodStepper } from "@/components/shared/PeriodStepper";
import { INVOICE_STATUS_OPTIONS } from "../../invoice-options";
import type { InvoicesTab } from "../../use-invoices-tab";

export function InvoiceFilters({ tab }: { tab: InvoicesTab }) {
  const { list } = tab;
  return (
    <div className="flex flex-col gap-3">
      <PeriodStepper value={tab.period} onChange={tab.setPeriod} />
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Invoice no., student or admission no." }}
        onReset={list.reset}
      >
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          options={INVOICE_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
        <FilterSelect
          label="Class"
          allLabel="All classes"
          options={tab.classOptions}
          value={list.filters.classId}
          onChange={(value) => list.setFilter("classId", value)}
        />
      </FilterBar>
    </div>
  );
}
