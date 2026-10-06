"use client";

import { BookOpen, History, Pencil } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { DRAFT_ACTION_LABEL } from "../options";
import { useBookListsTab, type SyllabusScope } from "../use-book-lists-tab";
import { BookItemsTable } from "./BookItemsTable";
import { BookListEditorDialog } from "./BookListEditorDialog";
import { BookListHistoryDrawer } from "./BookListHistoryDrawer";
import { ReviewControls } from "./ReviewControls";
import { RevisionMeta } from "./RevisionMeta";

const APPROVE_NOTE = "Approving publishes this revision; guardians of the class are notified. Earlier revisions are kept.";

export function BookListsTab(scope: SyllabusScope) {
  const tab = useBookListsTab(scope);
  const { current, query } = tab;

  if (tab.needsSession || tab.needsClass) {
    return (
      <Card>
        <EmptyState
          icon={BookOpen}
          title={tab.needsSession ? "No academic session" : "Pick a class"}
          description={
            tab.needsSession
              ? "Book lists belong to a session. Create one in Sessions & Calendar."
              : "Book lists are kept per class. Choose a class above to see or edit its list."
          }
        />
      </Card>
    );
  }
  if (tab.loading) return <Skeleton className="h-64 w-full" />;
  if (query.error) return <Card><ErrorState error={query.error} onRetry={() => query.refetch()} /></Card>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {current ? (
          <RevisionMeta {...current} />
        ) : (
          <InlineNotice>No book list for this class yet.</InlineNotice>
        )}
        <div className="flex flex-wrap gap-2">
          {tab.editAction && (
            <Button size="sm" variant="secondary" onClick={() => tab.editor.show(true)}>
              <Pencil />
              {DRAFT_ACTION_LABEL[tab.editAction]}
            </Button>
          )}
          <ReviewControls review={tab.review} approveNote={APPROVE_NOTE} />
          {current && (
            <Button size="sm" variant="ghost" onClick={() => tab.history.show(true)}>
              <History />
              Revision history
            </Button>
          )}
        </div>
      </div>
      {current && <BookItemsTable items={current.items} />}
      {tab.editor.open && scope.sessionId && scope.classId && (
        <BookListEditorDialog
          branchId={scope.branchId}
          sessionId={scope.sessionId}
          classId={scope.classId}
          source={current}
          isNewRevision={tab.editAction === "revise"}
          onClose={tab.editor.close}
        />
      )}
      {tab.history.open && current && <BookListHistoryDrawer current={current} onClose={tab.history.close} />}
    </div>
  );
}
