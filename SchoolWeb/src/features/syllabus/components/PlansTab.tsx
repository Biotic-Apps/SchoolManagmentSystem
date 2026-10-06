"use client";

import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { OptionSelect } from "@/components/shared/OptionSelect";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SyllabusScope } from "../use-book-lists-tab";
import { usePlansTab } from "../use-plans-tab";
import { PlanEditorDialog } from "./PlanEditorDialog";
import { PlanPanel } from "./PlanPanel";
import { TopicProgressDialog } from "./TopicProgressDialog";

export function PlansTab(scope: SyllabusScope) {
  const tab = usePlansTab(scope);
  const { query } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <OptionSelect
          label="Section"
          options={tab.sections.options}
          value={tab.sectionId}
          onChange={tab.selectSection}
          className="md:w-56"
        />
        <OptionSelect
          label="Subject"
          options={tab.subjects.options}
          value={tab.subjectId}
          onChange={tab.setSubjectId}
          disabled={!tab.sectionId}
          className="md:w-56"
        />
      </div>
      {!tab.ready && (
        <Card>
          <EmptyState
            icon={ListChecks}
            title="Pick a section and subject"
            description="Syllabus plans are kept per section and subject for the selected session."
          />
        </Card>
      )}
      {tab.loading && <Skeleton className="h-64 w-full" />}
      {tab.ready && !tab.loading && !!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {tab.ready && !tab.loading && !query.error && (
        <PlanPanel
          current={tab.current}
          shown={tab.shown}
          isApproved={tab.isApproved}
          trackingNote={tab.trackingNote}
          editAction={tab.editAction}
          onEdit={() => tab.editor.show(true)}
          review={tab.review}
          onUpdateTopic={tab.onUpdateTopic}
        />
      )}
      {tab.editor.open && tab.editorScope && (
        <PlanEditorDialog
          scope={tab.editorScope}
          source={tab.current}
          isNewRevision={tab.editAction === "revise"}
          onClose={tab.editor.close}
        />
      )}
      {tab.progressTarget.item && (
        <TopicProgressDialog topic={tab.progressTarget.item} onClose={tab.progressTarget.close} />
      )}
    </div>
  );
}
