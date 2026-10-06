"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { TabToolbar } from "@/features/classes/components/TabToolbar";
import type { AcademicScope } from "@/features/classes/use-academic-scope";
import { ENQUIRY_STATUS_OPTIONS } from "../options";
import { useEnquiriesTab } from "../use-enquiries-tab";
import { EnquiryFormDialog } from "./EnquiryFormDialog";
import { EnquiryUpdateDialog } from "./EnquiryUpdateDialog";

interface EnquiriesTabProps {
  scope: AcademicScope;
  onConverted: (applicationId: string) => void;
}

export function EnquiriesTab({ scope, onConverted }: EnquiriesTabProps) {
  const tab = useEnquiriesTab(scope, onConverted);
  const { list, query } = tab;
  const target = tab.convertTarget.item;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Add enquiry" onAdd={tab.canAdd ? () => tab.form.show(true) : undefined}>
        <FilterBar
          search={{ value: list.search, onChange: list.setSearch, placeholder: "Search child, guardian or phone" }}
          onReset={list.reset}
        >
          <FilterSelect
            label="Status"
            options={ENQUIRY_STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        </FilterBar>
      </TabToolbar>
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No enquiries found"
        emptyDescription="Record walk-in or phone enquiries here and follow them up until they apply."
        pagination={tab.pagination}
      />
      {tab.form.open && scope.branchId && scope.sessionId && (
        <EnquiryFormDialog
          context={{ branchId: scope.branchId, sessionId: scope.sessionId, classId: scope.classId }}
          classOptions={scope.classes.options}
          onClose={tab.form.close}
        />
      )}
      {tab.update.item && <EnquiryUpdateDialog item={tab.update.item} onClose={tab.update.close} />}
      <ConfirmDialog
        open={!!target}
        onOpenChange={tab.convertTarget.onOpenChange}
        title={`Convert ${target?.childName ?? "enquiry"} to an application?`}
        description="An application is created from this enquiry. Complete the child and guardian details on it next."
        confirmLabel="Convert"
        loading={tab.converting}
        onConfirm={tab.confirmConvert}
      />
    </div>
  );
}
