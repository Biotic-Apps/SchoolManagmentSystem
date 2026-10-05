"use client";

import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { RECORD_STATUS_OPTIONS } from "@/config/options";
import { useSectionsTab } from "../use-sections-tab";
import { SectionArchiveDialog } from "./SectionArchiveDialog";
import { SectionFormDialog } from "./SectionFormDialog";
import { TabToolbar } from "./TabToolbar";

interface SectionsTabProps {
  branchId: string;
  schoolId: string;
}

export function SectionsTab({ branchId, schoolId }: SectionsTabProps) {
  const tab = useSectionsTab(branchId, schoolId);
  const { list, query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <TabToolbar addLabel="Add section" onAdd={tab.canAdd ? () => tab.form.show() : undefined}>
        <FilterBar
          search={{ value: list.search, onChange: list.setSearch, placeholder: "Search sections" }}
          onReset={list.reset}
        >
          <OptionSelect
            label="Session"
            options={tab.sessions.options}
            value={tab.sessionId}
            onChange={(value) => list.setFilter("sessionId", value)}
            className="md:w-48"
          />
          <FilterSelect
            label="Class"
            allLabel="All classes"
            options={tab.classes.options}
            value={list.filters.classId}
            onChange={(value) => list.setFilter("classId", value)}
          />
          <FilterSelect
            label="Status"
            options={RECORD_STATUS_OPTIONS}
            value={list.filters.status}
            onChange={(value) => list.setFilter("status", value)}
          />
        </FilterBar>
      </TabToolbar>
      {tab.locked && (
        <InlineNotice tone="warning">This session is closed, so its sections are read-only.</InlineNotice>
      )}
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={tab.loading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle={tab.hasSessions ? "No sections found" : "No academic sessions yet"}
        emptyDescription={
          tab.hasSessions
            ? "Sections belong to a class in the selected session, e.g. Grade 1 A."
            : "Create a session in Sessions & Calendar before adding sections."
        }
        pagination={tab.pagination}
      />
      {tab.form.open && (
        <SectionFormDialog
          item={tab.form.item}
          context={{ branchId, sessionId: tab.sessionId, classId: list.filters.classId }}
          sessionOptions={tab.sessions.options}
          classOptions={tab.classes.options}
          onClose={tab.form.close}
        />
      )}
      <SectionArchiveDialog section={tab.archiveTarget.item} onClose={tab.archiveTarget.close} />
    </div>
  );
}
