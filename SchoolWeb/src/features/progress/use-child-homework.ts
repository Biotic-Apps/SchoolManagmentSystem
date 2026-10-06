import { addDays, todayIso } from "@/lib/dates";
import { useHomeworkCompletion } from "./api";
import type { HomeworkCompletionItem } from "./types";

const DAYS = 30;

export interface ChildHomeworkRow {
  id: string;
  date: string;
  subject: string | null;
  homework: string | null;
  status: string | null;
}

function toRow(item: HomeworkCompletionItem, index: number): ChildHomeworkRow {
  return {
    id: item.id ?? item.diaryEntryId ?? `${item.date}:${index}`,
    date: item.date,
    subject: item.subject?.name ?? item.subjectName ?? null,
    homework: item.homework ?? null,
    status: item.status ?? null,
  };
}

/** PARENT: the child's homework over the last 30 days, newest first. */
export function useChildHomework(childId: string | null) {
  const to = todayIso();
  const from = addDays(to, -(DAYS - 1));
  const query = useHomeworkCompletion(childId, from, to);
  const rows = (query.data ?? []).map(toRow).sort((a, b) => b.date.localeCompare(a.date));
  return { query, rows, days: DAYS };
}
