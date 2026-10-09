"use client";

import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/Button";
import { AcademicScopeBar } from "@/features/classes/components/AcademicScopeBar";
import { gradingColumns } from "../../grading-columns";
import { useGradingTab } from "../../use-grading-tab";
import { GradingSchemeDialog } from "./GradingSchemeDialog";

export function GradingTab() {
  const tab = useGradingTab();
  const { scope, query, editor } = tab;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-label text-fg-muted">
        A grading scheme turns exam percentages into grades (A+, A, B…) and sets the pass mark for the session. Every
        exam uses one; a new or edited scheme must be approved by someone else before results are worked out.
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <AcademicScopeBar scope={scope} />
        {tab.canAdd && (
          <Button onClick={() => editor.show()}>
            <Plus />
            New grading scheme
          </Button>
        )}
      </div>
      <DataTable
        columns={gradingColumns({
          canEdit: tab.canEdit,
          canApprove: tab.canApprove,
          isLocked: tab.isLocked,
          onEdit: editor.show,
          onApprove: (scheme) => tab.approve(scheme.id),
        })}
        rows={tab.schemes}
        getRowId={(row) => row.id}
        loading={scope.isLoading || query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No grading schemes"
        emptyDescription="Add a scheme for this session (e.g. A+ 90–100 … F 0–39, pass 40%) before creating exams."
      />
      {editor.open && scope.schoolId && scope.sessionId && (
        <GradingSchemeDialog
          scheme={editor.item}
          schoolId={scope.schoolId}
          sessionId={scope.sessionId}
          onClose={editor.close}
          onLocked={tab.markLocked}
        />
      )}
    </div>
  );
}
