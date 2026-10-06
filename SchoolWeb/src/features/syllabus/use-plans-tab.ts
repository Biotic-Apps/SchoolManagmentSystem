import { useState } from "react";
import { useCan } from "@/features/auth/use-can";
import { useSectionOptions } from "@/features/classes/sections-api";
import { useDialogState } from "@/lib/use-dialog-state";
import { useSyllabusPlans } from "./api";
import { draftAction, latestApproved, latestRevision } from "./options";
import type { Topic } from "./types";
import type { SyllabusScope } from "./use-book-lists-tab";
import { useReviewActions } from "./use-review-actions";
import { useClassSubjectOptions } from "@/features/classes/api";

export function usePlansTab({ branchId, sessionId, classId }: SyllabusScope) {
  const can = useCan();
  const sections = useSectionOptions(branchId, sessionId, classId);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const section = sections.sections.find((item) => item.id === sectionId) ?? null;
  const subjects = useClassSubjectOptions(section?.classId);

  const enabled = !!section && !!subjectId && !!sessionId;
  const query = useSyllabusPlans({ sectionId, subjectId, sessionId }, enabled);
  const current = latestRevision(query.data);
  // Progress is tracked on the approved plan even while a newer revision is being drafted.
  const approved = latestApproved(query.data);
  const review = useReviewActions("plan", current);
  const editor = useDialogState<true>();
  const progressTarget = useDialogState<Topic>();
  const canEdit = can("syllabus.edit");

  return {
    sections,
    sectionId: section ? sectionId : null,
    selectSection: (id: string) => {
      setSectionId(id);
      setSubjectId(null);
    },
    subjects,
    subjectId,
    setSubjectId,
    ready: enabled,
    editorScope: enabled ? { sectionId: section.id, subjectId, sessionId } : null,
    query,
    loading: enabled && query.isLoading,
    current,
    shown: approved ?? current,
    isApproved: !!approved,
    trackingNote:
      approved && current && current.id !== approved.id
        ? `Progress is tracked on approved revision ${approved.revision} until revision ${current.revision} is approved.`
        : null,
    review,
    editAction: canEdit ? draftAction(current?.status) : null,
    editor,
    progressTarget,
    onUpdateTopic: canEdit && approved ? progressTarget.show : undefined,
  };
}
