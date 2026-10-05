"use client";

import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSession } from "@/features/auth/session-context";
import { roleColumns } from "../role-columns";

export function RolesCard() {
  const { session } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your roles</CardTitle>
        <CardDescription>Roles are assigned by your administrator.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={roleColumns}
          rows={session?.assignments}
          getRowId={(row) => row.id}
          emptyTitle="No roles assigned"
        />
      </CardContent>
    </Card>
  );
}
