"use client";

import { RotateCw } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";
import { useSupportNotifications } from "../../use-support-notifications";
import { NotificationFilters } from "./NotificationFilters";

export function FailedNotificationsSection({ schoolId, canEdit }: { schoolId: string; canEdit: boolean }) {
  const section = useSupportNotifications(schoolId, canEdit);
  const { query } = section;
  const count = formatNumber(section.total);
  const noun = section.total === 1 ? "notification" : "notifications";

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <SectionHeading
          title="Failed notifications"
          actions={
            section.canResendAll && (
              <Button variant="secondary" size="sm" onClick={() => section.confirmAll.show(true)}>
                <RotateCw />
                Resend all
              </Button>
            )
          }
        />
        <p className="text-caption text-fg-muted">Emails, SMS and push messages that could not be delivered.</p>
      </div>
      <NotificationFilters list={section.list} />
      <DataTable
        columns={section.columns}
        rows={section.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No failed notifications in this period"
        emptyDescription="Every message in the selected range was delivered."
        pagination={section.pagination}
      />
      <ConfirmDialog
        open={section.confirmAll.open}
        onOpenChange={section.confirmAll.onOpenChange}
        title="Resend failed notifications?"
        description={`${count} failed ${noun} matching the current filters will be queued to send again.`}
        confirmLabel={`Resend ${count}`}
        loading={section.resendingAll}
        onConfirm={section.confirmResendAll}
      />
    </section>
  );
}
