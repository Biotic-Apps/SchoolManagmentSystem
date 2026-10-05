"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateRange } from "@/lib/format";
import type { AcademicSession } from "../types";
import { useTermsPanel } from "../use-terms-panel";
import { TermDeleteDialog } from "./TermDeleteDialog";
import { TermFormDialog } from "./TermFormDialog";

interface TermsDrawerProps {
  session: AcademicSession;
  onClose: () => void;
}

export function TermsDrawer({ session, onClose }: TermsDrawerProps) {
  const panel = useTermsPanel(session);
  const { query } = panel;

  return (
    <DetailDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Terms · ${session.name}`}
      description={
        <span className="flex items-center gap-2">
          {formatDateRange(session.startDate, session.endDate)}
          <StatusBadge status={session.status} />
        </span>
      }
      actions={
        panel.editable && (
          <Button size="sm" onClick={() => panel.form.show()}>
            <Plus />
            Add term
          </Button>
        )
      }
    >
      {session.status === "CLOSED" && (
        <InlineNotice>This session is closed, so its terms are read-only.</InlineNotice>
      )}
      <DataTable
        columns={panel.columns}
        rows={panel.terms}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        skeletonRows={3}
        emptyTitle="No terms yet"
        emptyDescription="Split the session into terms, e.g. Term 1 and Term 2. Terms can't overlap."
      />
      {panel.form.open && (
        <TermFormDialog session={session} term={panel.form.item} terms={panel.terms} onClose={panel.form.close} />
      )}
      <TermDeleteDialog sessionId={session.id} term={panel.deleteTarget.item} onClose={panel.deleteTarget.close} />
    </DetailDrawer>
  );
}
