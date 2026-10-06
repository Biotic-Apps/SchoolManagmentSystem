"use client";

import { UserPlus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { usePickupPersonsTab } from "../use-pickup-persons-tab";
import { AddPickupPersonDialog } from "./AddPickupPersonDialog";

interface PickupPersonsTabProps {
  studentId: string;
  readOnly?: boolean;
}

export function PickupPersonsTab({ studentId, readOnly = false }: PickupPersonsTabProps) {
  const tab = usePickupPersonsTab(studentId, readOnly);
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading
        title="Authorized pickup persons"
        actions={
          tab.canAdd && (
            <Button variant="secondary" onClick={() => tab.setAdding(true)}>
              <UserPlus />
              Add authorized person
            </Button>
          )
        }
      />
      <p className="text-label text-fg-muted">
        Only verified persons can collect the student. Guardians on record can always collect.
      </p>
      <DataTable
        columns={tab.columns}
        rows={tab.query.data}
        getRowId={(row) => row.id}
        loading={tab.query.isLoading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        skeletonRows={2}
        emptyTitle="No authorized pickup persons"
        emptyDescription={tab.canAdd ? "Add a driver, relative or neighbour who may collect your child." : undefined}
      />
      {tab.adding && <AddPickupPersonDialog studentId={studentId} onClose={() => tab.setAdding(false)} />}
      <ConfirmDialog
        open={tab.verifyTarget.open}
        onOpenChange={tab.verifyTarget.onOpenChange}
        title="Verify this pickup person?"
        description={`Check ${tab.verifyTarget.item?.name ?? "their"} CNIC and photo first. Once verified, the gate can release the student to them.`}
        confirmLabel="Verify"
        loading={tab.acting}
        onConfirm={tab.confirmVerify}
      />
      <ReasonDialog
        open={tab.revokeTarget.open}
        onOpenChange={tab.revokeTarget.onOpenChange}
        title="Revoke pickup authorization?"
        description={`${tab.revokeTarget.item?.name ?? "This person"} will be blocked at the gate.`}
        submitLabel="Revoke"
        submitting={tab.acting}
        onSubmit={tab.confirmRevoke}
      />
    </div>
  );
}
