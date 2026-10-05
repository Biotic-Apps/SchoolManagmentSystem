"use client";

import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDeviceSessionsCard } from "../use-device-sessions-card";

export function DeviceSessionsCard() {
  const card = useDeviceSessionsCard();
  const target = card.revokeTarget.item;

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Signed-in devices</CardTitle>
          <CardDescription>Sign out any device you don&apos;t recognise.</CardDescription>
        </div>
        <Button variant="danger" onClick={() => card.setConfirmAll(true)} className="self-start">
          <LogOut />
          Sign out of all devices
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={card.columns}
          rows={card.rows}
          getRowId={(row) => row.id}
          loading={card.query.isLoading}
          error={card.query.error}
          onRetry={() => card.query.refetch()}
          skeletonRows={2}
          emptyTitle="No active sessions"
        />
      </CardContent>
      <ConfirmDialog
        open={!!target}
        onOpenChange={card.revokeTarget.onOpenChange}
        title="Sign out this device?"
        description={`${target?.deviceName?.trim() || "The device"} will need to sign in again.`}
        confirmLabel="Sign out device"
        tone="danger"
        loading={card.revoking}
        onConfirm={card.confirmRevoke}
      />
      <ConfirmDialog
        open={card.confirmAll}
        onOpenChange={card.setConfirmAll}
        title="Sign out of all devices?"
        description="Every device, including this one, is signed out. You'll need to sign in again."
        confirmLabel="Sign out everywhere"
        tone="danger"
        loading={card.loggingOutAll}
        onConfirm={card.confirmLogoutAll}
      />
    </Card>
  );
}
