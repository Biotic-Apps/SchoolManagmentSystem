"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { NoChildState } from "@/features/auth/components/NoChildState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useChildEarlyLeave } from "../use-child-early-leave";
import { ChildEarlyLeaveDialog } from "./ChildEarlyLeaveDialog";

/** Parent: early-leave requests for the active child, with a request dialog. */
export function ChildEarlyLeavePanel() {
  const panel = useChildEarlyLeave();
  if (!panel.child) return <NoChildState description="Once the school verifies your child link, you can ask for early leave here." />;

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Early leave</CardTitle>
          <CardDescription>Ask the school to let {panel.child.name} leave before the end of the day.</CardDescription>
        </div>
        <Button className="self-start" onClick={() => panel.setRequesting(true)}>
          <Plus />
          Request early leave
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={panel.columns}
          rows={panel.rows}
          getRowId={(row) => row.id}
          loading={panel.query.isLoading}
          error={panel.query.error}
          onRetry={() => panel.query.refetch()}
          skeletonRows={2}
          emptyTitle="No early-leave requests"
        />
      </CardContent>
      {panel.requesting && (
        <ChildEarlyLeaveDialog
          studentId={panel.child.id}
          pickupOptions={panel.pickupOptions}
          onClose={() => panel.setRequesting(false)}
        />
      )}
    </Card>
  );
}
