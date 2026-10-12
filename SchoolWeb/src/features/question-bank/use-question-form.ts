import { useServerForm } from "@/lib/use-server-form";
import { useSaveQuestion } from "./api";
import { questionDefaults, questionSchema, toQuestionInput, type QuestionFormValues } from "./schemas";
import type { Question } from "./types";

export function useQuestionForm(question: Question | null, schoolId: string, onDone: () => void) {
  const save = useSaveQuestion();
  const server = useServerForm<QuestionFormValues, Question>({
    schema: questionSchema,
    defaultValues: questionDefaults(question),
    onSubmit: (values) => save.mutateAsync({ id: question?.id, input: toQuestionInput(values, schoolId) }),
    onSuccess: onDone,
  });
  return server;
}
