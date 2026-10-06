import { useServerForm } from "@/lib/use-server-form";
import { useSaveEnquiry } from "./api";
import { enquiryFormDefaults, enquirySchema, toEnquiryInput, type EnquiryFormValues } from "./schemas";

export interface EnquiryFormContext {
  branchId: string;
  sessionId: string;
  classId: string | undefined;
}

export function useEnquiryForm(context: EnquiryFormContext, onDone: () => void) {
  const save = useSaveEnquiry();
  return useServerForm<EnquiryFormValues>({
    schema: enquirySchema,
    defaultValues: enquiryFormDefaults(context.classId),
    onSubmit: (values) => save.mutateAsync({ input: toEnquiryInput(values, context) }),
    onSuccess: onDone,
  });
}
