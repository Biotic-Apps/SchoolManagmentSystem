"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import type { Option } from "@/components/shared/OptionSelect";
import { Input } from "@/components/ui/Input";
import type { ListState } from "@/lib/use-list-state";
import { PAYMENT_METHOD_OPTIONS } from "../../payment-options";
import type { PaymentFilters } from "../../use-payments-tab";

interface PaymentFiltersProps {
  list: ListState<PaymentFilters>;
  cashierOptions: Option[];
}

export function PaymentFilterBar({ list, cashierOptions }: PaymentFiltersProps) {
  const { filters, setFilter } = list;
  return (
    <FilterBar onReset={list.reset}>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          aria-label="From date"
          value={filters.from ?? ""}
          max={filters.to}
          onChange={(event) => setFilter("from", event.target.value || undefined)}
          className="w-40"
        />
        <span className="text-label text-fg-muted">to</span>
        <Input
          type="date"
          aria-label="To date"
          value={filters.to ?? ""}
          min={filters.from}
          onChange={(event) => setFilter("to", event.target.value || undefined)}
          className="w-40"
        />
      </div>
      <FilterSelect label="Method" options={PAYMENT_METHOD_OPTIONS} value={filters.method} onChange={(value) => setFilter("method", value)} />
      {cashierOptions.length > 0 && (
        <FilterSelect
          label="Cashier"
          options={cashierOptions}
          value={filters.cashierId}
          onChange={(value) => setFilter("cashierId", value)}
        />
      )}
    </FilterBar>
  );
}
