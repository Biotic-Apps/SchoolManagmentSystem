"use client";

import { Pencil } from "lucide-react";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DRAFT_ACTION_LABEL, type DraftAction } from "../options";
import type { SyllabusPlan, Topic } from "../types";
import type { ReviewActions } from "../use-review-actions";
import { PlanProgressSummary } from "./PlanProgressSummary";
import { PlanProgressView } from "./PlanProgressView";
import { ReviewControls } from "./ReviewControls";
import { RevisionMeta } from "./RevisionMeta";

const APPROVE_NOTE = "Once approved, teachers track topic progress against this plan.";

interface PlanPanelProps {
  current: SyllabusPlan | null;
  /** Approved plan when there is one (progress is tracked on it), else the draft outline. */
  shown: SyllabusPlan | null;
  isApproved: boolean;
  trackingNote: string | null;
  editAction: DraftAction;
  onEdit: () => void;
  review: ReviewActions;
  onUpdateTopic?: (topic: Topic) => void;
}

/** Latest revision with its workflow actions, then progress on the approved plan. */
export function PlanPanel({ current, shown, isApproved, trackingNote, editAction, onEdit, review, onUpdateTopic }: PlanPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        {current ? <RevisionMeta {...current} /> : <InlineNotice>No syllabus plan for this subject yet.</InlineNotice>}
        <div className="flex flex-wrap gap-2">
          {editAction && (
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Pencil />
              {DRAFT_ACTION_LABEL[editAction]}
            </Button>
          )}
          <ReviewControls review={review} approveNote={APPROVE_NOTE} />
        </div>
      </div>
      {trackingNote && <InlineNotice>{trackingNote}</InlineNotice>}
      {shown && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <SectionHeading title={isApproved ? "Progress" : "Draft outline"} />
            {isApproved && <PlanProgressSummary progress={shown.progress} label="Plan progress" />}
            <PlanProgressView plan={shown} onUpdate={isApproved ? onUpdateTopic : undefined} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
