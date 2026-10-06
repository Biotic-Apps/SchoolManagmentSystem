import { hasErrorCode } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { useSaveDiary } from "./api";
import { diaryDefaults, diarySchema, toDiaryInput, type DiaryFormValues } from "./schemas";
import type { DiaryEntry } from "./types";

interface DiaryEditorContext {
  sectionId: string;
  date: string;
  entry: DiaryEntry | null;
}

export function useDiaryEditor({ sectionId, date, entry }: DiaryEditorContext, onDone: () => void) {
  const save = useSaveDiary();
  return useServerForm<DiaryFormValues, DiaryEntry | null>({
    schema: diarySchema,
    defaultValues: diaryDefaults(entry),
    onSubmit: async (values) => {
      try {
        return await save.mutateAsync(toDiaryInput(values, { sectionId, date }));
      } catch (error) {
        if (!hasErrorCode(error, "RECORD_LOCKED")) throw error;
        toast.error("Diary closed for today");
        return null;
      }
    },
    onSuccess: (result) => {
      if (result) toast.success(entry?.status === "PUBLISHED" ? "Diary entry updated" : "Draft saved");
      onDone();
    },
  });
}
