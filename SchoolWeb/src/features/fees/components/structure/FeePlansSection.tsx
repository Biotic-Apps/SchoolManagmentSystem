"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { feePlanColumns } from "../../fee-plan-columns";
import type { FeeStructureTab } from "../../use-fee-structure-tab";

export function FeePlansSection({ tab }: { tab: FeeStructureTab }) {
  const columns = feePlanColumns({
    className: tab.className,
    canEdit: tab.canEdit,
    canApprove: tab.canApprove,
    approvingId: tab.approvingId,
    onEdit: (plan) => tab.planDialog.show(plan),
    onApprove: tab.approvePlan,
  });

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading
        title="Fee plans"
        actions={
          tab.canAdd && (
            <Button size="sm" onClick={() => tab.planDialog.show()} disabled={!tab.sessionId}>
              <Plus />
              New fee plan
            </Button>
          )
        }
      />
      <OptionSelect
        label="Session"
        options={tab.sessionOptions}
        value={tab.sessionId}
        onChange={tab.setSessionId}
        className="md:w-64"
      />
      <DataTable
        columns={columns}
        rows={tab.sessionId ? tab.plans.data : []}
        getRowId={(row) => row.id}
        loading={tab.sessionsLoading || tab.plans.isLoading}
        error={tab.plans.error}
        onRetry={() => tab.plans.refetch()}
        emptyTitle={tab.sessionId ? "No fee plans for this session" : "No academic session yet"}
        emptyDescription={
          tab.sessionId
            ? "Create a plan per class. Invoices are generated only from approved plans."
            : "Create an academic session for this branch first."
        }
      />
    </section>
  );
}
