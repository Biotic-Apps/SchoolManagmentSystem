import { useQueryClient } from "@tanstack/react-query";
import { addDocuments, documentKeys } from "@/features/documents/api";
import { toDocumentInput, type DocumentFormValues } from "@/features/documents/schemas";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { admissionKeys, useSaveApplication } from "./api";
import { applicationFormDefaults, applicationSchema, toApplicationInput, type ApplicationFormValues } from "./schemas";
import type { Application } from "./types";

export interface ApplicationFormContext {
  branchId: string;
  sessionId: string;
  classId: string | undefined;
}

/** Create (with staged documents uploaded afterwards) or edit an application before a decision. */
export function useApplicationForm(
  item: Application | null,
  context: ApplicationFormContext,
  onDone: (application: Application) => void,
) {
  const save = useSaveApplication();
  const queryClient = useQueryClient();

  // The application already exists at this point, so a failed upload must not fail the form.
  const uploadStaged = async (applicationId: string, documents: DocumentFormValues[]) => {
    if (documents.length === 0) return;
    try {
      await addDocuments("APPLICATION", applicationId, documents.map(toDocumentInput));
    } catch (error) {
      toast.error(`Application saved, but a document failed to upload: ${errorMessage(error)} Add it from the application.`);
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: admissionKeys.all }),
      queryClient.invalidateQueries({ queryKey: documentKeys.all }),
    ]);
  };

  return useServerForm<ApplicationFormValues, Application>({
    schema: applicationSchema,
    defaultValues: applicationFormDefaults(item, context.classId),
    onSubmit: async (values) => {
      if (item) {
        const input = toApplicationInput(values, { branchId: item.branchId, sessionId: item.sessionId });
        return save.mutateAsync({ id: item.id, input });
      }
      const created = await save.mutateAsync({ input: toApplicationInput(values, context) });
      await uploadStaged(created.id, values.documents);
      return created;
    },
    onSuccess: onDone,
  });
}
