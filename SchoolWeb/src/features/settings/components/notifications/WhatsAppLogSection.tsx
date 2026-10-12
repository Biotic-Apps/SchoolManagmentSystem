"use client";

import { useMemo, useState } from "react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { DataTable } from "@/components/shared/DataTable";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, textOrDash } from "@/lib/format";
import { useWhatsAppMessages, type WhatsAppMessage } from "../../settings-api";

interface WhatsAppLogSectionProps {
  schoolId: string;
}

const STATUS_OPTIONS: { id: string; name: string }[] = [
  { id: "all", name: "All statuses" },
  { id: "SENT", name: "Sent" },
  { id: "FAILED", name: "Failed" },
  { id: "PENDING", name: "Pending" },
];

function statusBadge(status: string) {
  switch (status) {
    case "SENT":
      return <Badge tone="success" dot>Sent</Badge>;
    case "FAILED":
      return <Badge tone="error" dot>Failed</Badge>;
    default:
      return <Badge tone="neutral">{status}</Badge>;
  }
}

const COLUMNS: DataTableColumn<WhatsAppMessage>[] = [
  { id: "createdAt", header: "When", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.createdAt) },
  { id: "to", header: "To", className: "whitespace-nowrap", cell: (row) => row.to },
  { id: "templateName", header: "Template", className: "min-w-32", cell: (row) => row.templateName },
  { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => statusBadge(row.status) },
  {
    id: "error",
    header: "Error",
    className: "min-w-48 max-w-80 whitespace-normal break-words text-fg-muted",
    cell: (row) => textOrDash(row.error),
  },
  {
    id: "sentAt",
    header: "Sent at",
    className: "whitespace-nowrap",
    cell: (row) => (row.sentAt ? formatDateTime(row.sentAt) : "-"),
  },
];

export function WhatsAppLogSection({ schoolId }: WhatsAppLogSectionProps) {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const query = useWhatsAppMessages(schoolId, {
    ...(status !== "all" && { status }),
    page,
    pageSize,
  });

  const rows = useMemo(() => query.data?.data ?? [], [query.data]);
  const total = query.data?.meta?.total ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="WhatsApp message log" />
      <p className="text-caption text-fg-muted">
        All WhatsApp messages sent from this school, including delivery status.
      </p>
      <div className="flex items-center gap-3">
        <OptionSelect
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(id) => {
            setStatus(id);
            setPage(1);
          }}
          className="w-40"
        />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No WhatsApp messages"
        emptyDescription="No messages have been sent via WhatsApp yet."
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
