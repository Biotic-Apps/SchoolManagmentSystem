"use client";

import { DoorOpen } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { useDeparturesTab } from "../use-departures-tab";
import { RecordDepartureDialog } from "./RecordDepartureDialog";

export function DeparturesTab({ branchId, date }: { branchId: string; date: string }) {
  const tab = useDeparturesTab(branchId, date);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-label text-fg-muted">Every student released at the gate, with who collected them.</p>
        {tab.canRecord && (
          <Button onClick={() => tab.setRecording(true)}>
            <DoorOpen />
            Record departure
          </Button>
        )}
      </div>
      <DataTable
        columns={tab.columns}
        rows={tab.query.data}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        emptyTitle="No departures recorded"
        emptyDescription="Departures recorded at the gate for this day appear here."
      />
      {tab.recording && <RecordDepartureDialog branchId={branchId} date={date} onClose={() => tab.setRecording(false)} />}
    </div>
  );
}
