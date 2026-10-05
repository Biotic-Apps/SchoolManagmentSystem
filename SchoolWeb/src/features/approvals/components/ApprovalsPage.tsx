"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { approvalColumns } from "../approval-columns";
import { APPROVAL_STATUS_OPTIONS, APPROVAL_TYPE_OPTIONS } from "../options";
import { useApprovalsPage } from "../use-approvals-page";
import { ApprovalDetailDrawer } from "./ApprovalDetailDrawer";

export function ApprovalsPage() {
  const page = useApprovalsPage();
  const { list, query } = page;

  return (
    <>
      <PageHeader
        title="Approvals"
        description="Requests waiting for your decision and the ones you raised."
      />
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search requests" }}
        onReset={list.reset}
      >
        <FilterSelect
          label="Status"
          options={APPROVAL_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
        <FilterSelect
          label="Type"
          options={APPROVAL_TYPE_OPTIONS}
          value={list.filters.type}
          onChange={(value) => list.setFilter("type", value)}
          className="md:w-56"
        />
      </FilterBar>
      <DataTable
        columns={approvalColumns}
        rows={page.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={page.detail.show}
        emptyTitle={list.filters.status === "PENDING" ? "Nothing waiting for a decision" : "No requests found"}
        emptyDescription="Requests from attendance, leave, fees and other modules appear here."
        pagination={page.pagination}
      />
      <ApprovalDetailDrawer request={page.detail.item} onClose={page.detail.close} />
    </>
  );
}
