"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { MIN_DAYS_OPTIONS } from "../../due-options";
import { useDuesTab } from "../../use-dues-tab";
import { StudentLedgerDialog } from "../ledger/StudentLedgerDialog";
import { RecordPaymentDialog } from "../payments/RecordPaymentDialog";
import { DuesSelectionBar } from "./DuesSelectionBar";

export function DuesTab({ branchId }: { branchId: string | null }) {
  const tab = useDuesTab(branchId);
  const { list, query, ledger, payment } = tab;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: "Search student or admission no." }}
        onReset={list.reset}
      >
        <FilterSelect
          label="Class"
          options={tab.classOptions}
          value={list.filters.classId}
          onChange={(value) => list.setFilter("classId", value)}
        />
        <FilterSelect
          label="Overdue for"
          allLabel="Any balance"
          options={MIN_DAYS_OPTIONS}
          value={list.filters.minDays}
          onChange={(value) => list.setFilter("minDays", value)}
        />
      </FilterBar>
      {tab.canRemind && (
        <DuesSelectionBar
          selection={tab.selection}
          hasRows={!!tab.rows?.length}
          sending={tab.sending}
          onSend={tab.sendReminders}
        />
      )}
      <JobProgressNotice jobId={tab.reminderJobId} label="Sending reminders" doneLabel="Reminders sent to guardians." />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.student.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No dues"
        emptyDescription="Students with an unpaid balance appear here with how long it has been due."
        pagination={tab.pagination}
      />
      <StudentLedgerDialog student={ledger.item?.student ?? null} open={ledger.open} onOpenChange={ledger.onOpenChange} />
      <RecordPaymentDialog open={payment.open} onOpenChange={payment.onOpenChange} student={payment.item?.student ?? null} />
    </div>
  );
}
