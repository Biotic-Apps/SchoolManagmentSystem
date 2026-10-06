import { useServerForm } from "@/lib/use-server-form";
import { useSaveBookListDraft } from "./api";
import { bookListDefaults, bookListSchema, toBookListInput, type BookListValues } from "./schemas";
import type { BookList } from "./types";
import { useClassSubjectOptions } from "@/features/classes/api";

interface BookListEditorArgs {
  branchId: string;
  sessionId: string;
  classId: string;
  /** Prefills the draft: the current draft, or the approved list when starting a new revision. */
  source: BookList | null;
  onDone: () => void;
}

export function useBookListEditor({ branchId, sessionId, classId, source, onDone }: BookListEditorArgs) {
  const save = useSaveBookListDraft(classId);
  const subjects = useClassSubjectOptions(classId);
  const server = useServerForm<BookListValues>({
    schema: bookListSchema,
    defaultValues: bookListDefaults(source),
    onSubmit: (values) => save.mutateAsync(toBookListInput(values, branchId, sessionId)),
    onSuccess: onDone,
  });
  return { ...server, subjectOptions: subjects.options };
}
