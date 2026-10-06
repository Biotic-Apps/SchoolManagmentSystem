import { useState } from "react";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { useCan } from "@/features/auth/use-can";
import { useDiaryEntries } from "@/features/diary/api";
import { todayIso } from "@/lib/dates";
import { useSectionStudents } from "./use-section-students";

/** Staff: published diary homework of one section and day, then the per-student ticks. */
export function useHomeworkTab(sectionId: string | null) {
  const can = useCan();
  const guard = useGuardedAction();
  const [date, setDate] = useState(todayIso);
  const [chosenId, setEntryId] = useState<string | null>(null);
  const diary = useDiaryEntries({ sectionId, date }, !!sectionId);
  const { query: studentsQuery, students } = useSectionStudents(sectionId);

  const entries = (diary.data ?? []).filter((entry) => entry.status === "PUBLISHED" && !!entry.homework?.trim());
  const entry = entries.find((item) => item.id === chosenId) ?? entries[0] ?? null;

  return {
    date,
    setDate: (value: string) => guard(() => setDate(value)),
    diary,
    entries,
    entry,
    selectEntry: (id: string) => guard(() => setEntryId(id)),
    studentsQuery,
    students,
    canEdit: can("progress.edit"),
  };
}
