"use client";

import { BarChart3, Building2, Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BranchPickerSelect } from "@/features/branches/components/BranchPickerSelect";
import { noticeColumns } from "../notice-columns";
import { NOTICE_STATUS_OPTIONS } from "../options";
import { useAudienceOptions } from "../use-audience-options";
import { useNoticesPage } from "../use-notices-page";
import { NoticeComposeDialog } from "./NoticeComposeDialog";
import { NoticeDetailDrawer } from "./NoticeDetailDrawer";
import { NoticeReadsDialog } from "./NoticeReadsDialog";

/** notices.add: compose, publish and track notices for a branch. */
export function NoticesManagePage() {
  const page = useNoticesPage();
  const { scope, list, composer, reads, preview } = page;
  const audience = useAudienceOptions({ schoolId: scope.schoolId, branchId: scope.branchId, sessionId: scope.sessionId });
  const columns = noticeColumns({
    canPublish: page.canPublish,
    onEdit: composer.show,
    onPublish: page.publish,
    onReads: reads.show,
    nameOf: audience.nameOf,
  });

  return (
    <>
      <PageHeader
        title="Notices"
        description="Announcements for parents and staff, addressed to the whole school, branches, classes or sections."
        actions={
          scope.branchId && (
            <Button onClick={() => composer.show()}>
              <Plus />
              Compose
            </Button>
          )
        }
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <BranchPickerSelect picker={scope.picker} />
        <FilterSelect
          label="Status"
          options={NOTICE_STATUS_OPTIONS}
          value={list.filters.status}
          onChange={(value) => list.setFilter("status", value)}
        />
      </div>
      {!scope.isLoading && !scope.branchId ? (
        <Card>
          <EmptyState icon={Building2} title="No branch in your scope" description="Notices are managed per branch." />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={page.rows}
          getRowId={(row) => row.id}
          loading={scope.isLoading || page.query.isLoading}
          error={page.query.error}
          onRetry={() => page.query.refetch()}
          onRowClick={page.open}
          pagination={page.pagination}
          emptyTitle="No notices yet"
          emptyDescription="Compose a notice to reach parents and staff."
        />
      )}
      {composer.open && (
        <NoticeComposeDialog
          notice={composer.item}
          branchId={scope.branchId}
          audienceOptions={audience}
          canPublish={page.canPublish}
          onClose={composer.close}
        />
      )}
      <NoticeDetailDrawer
        notice={preview.item}
        onOpenChange={preview.onOpenChange}
        showStatus
        actions={
          preview.item &&
          preview.item.status !== "PENDING_REVIEW" && (
            <Button variant="secondary" size="sm" onClick={() => reads.show(preview.item ?? undefined)}>
              <BarChart3 />
              Read receipts
            </Button>
          )
        }
      />
      <NoticeReadsDialog notice={reads.item} onOpenChange={reads.onOpenChange} />
    </>
  );
}
