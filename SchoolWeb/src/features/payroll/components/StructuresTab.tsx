"use client";

import { UserPlus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { IconTile } from "@/components/shared/IconTile";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { STAFF_TYPE_OPTIONS } from "../options";
import { structureStaffColumns } from "../structure-columns";
import { useStructuresTab } from "../use-structures-tab";
import { StructureDrawer } from "./StructureDrawer";

/** Salary setup for every staff type: who has a salary, who is missing one, and the principal. */
export function StructuresTab({ branchId }: { branchId: string | null }) {
  const tab = useStructuresTab(branchId);

  return (
    <div className="flex flex-col gap-4">
      {tab.principalMissing && (
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <IconTile icon={UserPlus} tone="info" />
              <div className="flex flex-col">
                <span className="text-body font-semibold text-fg">{tab.principalName} is not on payroll yet</span>
                <span className="text-label text-fg-muted">
                  Add the principal to set their salary. Their pay is approved by the super admin, never by themselves.
                </span>
              </div>
            </div>
            {tab.canEdit && (
              <Button loading={tab.addingPrincipal} onClick={tab.addPrincipal}>
                Add principal to payroll
              </Button>
            )}
          </CardContent>
        </Card>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <FilterSelect
          label="Staff type"
          allLabel="All staff types"
          options={STAFF_TYPE_OPTIONS}
          value={tab.staffType}
          onChange={tab.setStaffType}
          className="md:w-56"
        />
      </div>
      {tab.missingCount > 0 && (
        <InlineNotice tone="warning">
          {tab.missingCount} staff {tab.missingCount === 1 ? "member has" : "members have"} no salary yet and will be left out of payroll.
          Select a name to set their salary.
        </InlineNotice>
      )}
      <DataTable
        columns={structureStaffColumns}
        rows={tab.rows}
        getRowId={(row) => row.staffId}
        loading={tab.loading}
        error={tab.query.error}
        onRetry={() => tab.query.refetch()}
        onRowClick={tab.drawer.show}
        emptyTitle="No staff found"
        emptyDescription="Add staff in Staff first (teachers, coordinators, helpers, office staff). They appear here to get a salary."
      />
      <StructureDrawer staff={tab.drawer.item} onClose={tab.drawer.close} />
    </div>
  );
}
