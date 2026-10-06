import { useState } from "react";
import { useSession } from "@/features/auth/session-context";
import { useCan } from "@/features/auth/use-can";
import { useClassSubjectOptions } from "@/features/classes/api";
import { useSectionScope } from "@/features/classes/use-section-scope";
import { todayIso } from "@/lib/dates";
import { useDialogState } from "@/lib/use-dialog-state";
import { useDiaryEntries, usePublishDiary } from "./api";
import { EDITABLE_STATUSES, PUBLISHABLE_STATUSES, notifyPublishResult, toastDiaryError } from "./options";
import type { DiaryEntry } from "./types";

/** Staff: one section's diary for one day, with add / edit / publish. */
export function useDiaryTab() {
  const can = useCan();
  const isHelper = useSession().session?.activeRole === "HELPER";
  const scope = useSectionScope();
  const [date, setDate] = useState(todayIso);
  const sectionId = scope.sectionId;
  const query = useDiaryEntries({ sectionId, date }, !!sectionId);
  const subjects = useClassSubjectOptions(scope.section?.classId);
  const editor = useDialogState<DiaryEntry>();
  const publish = usePublishDiary();

  const entries = query.data ?? [];
  const usedSubjects = new Set(entries.map((entry) => entry.subject.id));
  const canEdit = can("diary.edit");
  const canPublish = can("diary.publish") && !isHelper;

  return {
    scope,
    date,
    setDate,
    sectionId,
    query,
    entries,
    editor,
    canAdd: canEdit && !!sectionId,
    /** Subjects without an entry yet (PUT is an upsert per section, subject and date). */
    freeSubjects: subjects.options.filter((option) => !usedSubjects.has(option.id)),
    subjectOptions: subjects.options,
    isHelper,
    canEditEntry: (entry: DiaryEntry) =>
      canEdit && (isHelper ? entry.status === "DRAFT" : EDITABLE_STATUSES.includes(entry.status)),
    canPublishEntry: (entry: DiaryEntry) => canPublish && PUBLISHABLE_STATUSES.includes(entry.status),
    publishingId: publish.isPending ? publish.variables : undefined,
    publish: (entry: DiaryEntry) =>
      publish.mutate(entry.id, { onSuccess: notifyPublishResult, onError: toastDiaryError }),
  };
}

export type DiaryTabState = ReturnType<typeof useDiaryTab>;
