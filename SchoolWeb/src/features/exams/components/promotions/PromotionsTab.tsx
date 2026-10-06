"use client";

import { GraduationCap } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { Card } from "@/components/ui/Card";
import { usePromotionsTab } from "../../use-promotions-tab";
import { PromotionDialogs } from "./PromotionDialogs";
import { PromotionScopeBar } from "./PromotionScopeBar";
import { PromotionSummary } from "./PromotionSummary";
import { PromotionToolbar } from "./PromotionToolbar";

/** Year-end promotion: suggestions from published results, overrides, approval and apply. */
export function PromotionsTab() {
  const tab = usePromotionsTab();
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <PromotionScopeBar tab={tab} />
      {tab.job && (
        <JobProgressNotice
          key={tab.job.id}
          jobId={tab.job.id}
          label={tab.job.label}
          doneLabel={tab.job.doneLabel}
          invalidate={[["exams", "promotions"]]}
        />
      )}
      {!tab.ready ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Choose a branch and session"
            description="Promotion suggestions are built per branch for the session that is ending."
          />
        </Card>
      ) : (
        <>
          <PromotionSummary tab={tab} />
          <PromotionToolbar tab={tab} />
          <DataTable
            columns={tab.columns}
            rows={tab.rows}
            getRowId={(row) => row.id}
            loading={query.isLoading}
            error={query.error}
            onRetry={() => query.refetch()}
            skeletonRows={8}
            emptyTitle="No promotion suggestions"
            emptyDescription={
              tab.canSuggest
                ? "Use Suggest to build decisions from the session's published exam results."
                : "Suggestions appear here once the coordinator or principal builds them."
            }
          />
        </>
      )}
      <PromotionDialogs tab={tab} />
    </div>
  );
}
