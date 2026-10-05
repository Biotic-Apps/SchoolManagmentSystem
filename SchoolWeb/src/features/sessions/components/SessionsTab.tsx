"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useSessionsTab } from "../use-sessions-tab";
import { SessionFormDialog } from "./SessionFormDialog";
import { SessionTransitionDialog } from "./SessionTransitionDialog";
import { TermsDrawer } from "./TermsDrawer";

export function SessionsTab({ branchId }: { branchId: string | null }) {
  const tab = useSessionsTab(branchId);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Academic sessions"
        actions={
          tab.canAdd && (
            <Button size="sm" onClick={() => tab.form.show()}>
              <Plus />
              New session
            </Button>
          )
        }
      />
      <DataTable
        columns={tab.columns}
        rows={tab.rows}
        getRowId={(row) => row.id}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        onRowClick={tab.terms.show}
        emptyTitle="No sessions yet"
        emptyDescription="Create the academic session (e.g. 2026-27), add its terms, then activate it."
      />
      {tab.form.open && <SessionFormDialog session={tab.form.item} branchId={branchId} onClose={tab.form.close} />}
      {tab.terms.item && <TermsDrawer session={tab.terms.item} onClose={tab.terms.close} />}
      <SessionTransitionDialog target={tab.transition} onClose={tab.closeTransition} />
    </div>
  );
}
