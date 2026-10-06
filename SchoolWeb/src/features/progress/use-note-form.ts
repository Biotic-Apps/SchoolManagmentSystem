import { notifyActionResult } from "@/lib/probation";
import { useServerForm } from "@/lib/use-server-form";
import { useAddProgressNote } from "./api";
import { noteDefaults, noteSchema, toNoteInput } from "./schemas";

export function useNoteForm(studentId: string, onDone: () => void) {
  const add = useAddProgressNote(studentId);
  return useServerForm({
    schema: noteSchema,
    defaultValues: noteDefaults,
    onSubmit: (values) => add.mutateAsync(toNoteInput(values)),
    onSuccess: (result) => {
      notifyActionResult(result, "Note added");
      onDone();
    },
  });
}
