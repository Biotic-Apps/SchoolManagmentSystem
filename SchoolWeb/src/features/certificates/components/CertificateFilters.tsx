"use client";

import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { CERTIFICATE_STATUS_OPTIONS, CERTIFICATE_TYPE_OPTIONS } from "../options";
import type { CertificatesPage } from "../use-certificates-page";

export function CertificateFilters({ page }: { page: CertificatesPage }) {
  const { list } = page;
  return (
    <FilterBar onReset={list.reset}>
      {!page.isParent && <BranchPickerSelect picker={page.picker} className="md:w-56" />}
      <FilterSelect
        label="Type"
        allLabel="All types"
        options={CERTIFICATE_TYPE_OPTIONS}
        value={list.filters.type}
        onChange={(value) => list.setFilter("type", value)}
      />
      <FilterSelect
        label="Status"
        options={CERTIFICATE_STATUS_OPTIONS}
        value={list.filters.status}
        onChange={(value) => list.setFilter("status", value)}
      />
    </FilterBar>
  );
}
