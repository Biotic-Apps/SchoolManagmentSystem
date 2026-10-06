"use client";

import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useSupportJobsSection } from "../../use-support-jobs";
import { JobDetailDrawer } from "./JobDetailDrawer";
import { JobFilters } from "./JobFilters";

export function FailedJobsSection({ canEdit }: { canEdit: boolean }) {
  const section = useSupportJobsSection(canEdit);
  const { query } = section;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <SectionHeading title="Background jobs" />
        <p className="text-caption text-fg-muted">
          Invoices, reports, PDFs, imports and other work that runs in the background. Select a job to see its full error.
        </p>
      </div>
      <JobFilters list={section.list} />
      <DataTable
        columns={section.columns}
        rows={section.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={section.detail.show}
        emptyTitle="No jobs found"
        emptyDescription="No background jobs match these filters."
        pagination={section.pagination}
      />
      <JobDetailDrawer section={section} />
    </section>
  );
}
